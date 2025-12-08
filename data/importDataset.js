const path = require('path');
const fs = require('fs');

// Add server node_modules to path
const serverPath = path.join(__dirname, '..', 'server');
process.env.NODE_PATH = path.join(serverPath, 'node_modules');
require('module')._initPaths();

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Require modules from server
const mongoose = require('mongoose');
const csv = require('csv-parser');

// Import models - need to use compiled JS files
const Video = require(path.join(serverPath, 'dist', 'models', 'Video')).default;
let hdfsService;
try {
  hdfsService = require(path.join(serverPath, 'dist', 'services', 'hdfsService')).default;
} catch (e) {
  console.warn('HDFS service not available');
  hdfsService = { isEnabled: () => Promise.resolve(false) };
}

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube_trends';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Helper function to calculate trending score
function calculateTrendingScore(views, likes, comments) {
  return (views || 0) * 0.1 + (likes || 0) * 2 + (comments || 0) * 5;
}

// Helper function to calculate engagement rate
function calculateEngagementRate(views, likes, comments) {
  if (!views || views === 0) return 0;
  return ((likes || 0) + (comments || 0)) / views * 100;
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration) {
  if (!duration) return null;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

// Import CSV file
async function importCSVFile(filePath, countryCode = 'US') {
  return new Promise((resolve, reject) => {
    const videos = [];
    let rowCount = 0;
    const batchSize = 1000;

    console.log(`\n📂 Processing file: ${path.basename(filePath)}`);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          // Map CSV columns to our Video model
          const video = {
            videoId: row.video_id || row.videoId,
            title: row.title || '',
            description: row.description || '',
            channelId: row.channel_id || row.channelId,
            channelTitle: row.channel_title || row.channelTitle,
            publishedAt: new Date(row.publish_time || row.publishedAt),
            thumbnails: {
              default: row.thumbnail_link || '',
              medium: row.thumbnail_link || '',
              high: row.thumbnail_link || ''
            },
            statistics: {
              viewCount: parseInt(row.views || row.view_count || '0'),
              likeCount: parseInt(row.likes || row.like_count || '0'),
              commentCount: parseInt(row.comment_count || row.comments || '0')
            },
            categoryId: row.category_id || row.categoryId || '',
            tags: row.tags ? row.tags.split('|').filter(t => t) : [],
            duration: row.duration || null,
            trendingScore: calculateTrendingScore(
              parseInt(row.views || row.view_count || '0'),
              parseInt(row.likes || row.like_count || '0'),
              parseInt(row.comment_count || row.comments || '0')
            ),
            engagementRate: calculateEngagementRate(
              parseInt(row.views || row.view_count || '0'),
              parseInt(row.likes || row.like_count || '0'),
              parseInt(row.comment_count || row.comments || '0')
            ),
            countryCode: countryCode,
            trendingDate: row.trending_date ? new Date(row.trending_date) : new Date()
          };

          videos.push(video);
          rowCount++;

          // Batch insert
          if (videos.length >= batchSize) {
            const batch = videos.splice(0, batchSize);
            await insertBatch(batch);
            process.stdout.write(`\r  Processed: ${rowCount} videos...`);
          }
        } catch (error) {
          console.error(`\nError processing row:`, error);
        }
      })
      .on('end', async () => {
        try {
          // Insert remaining videos
          if (videos.length > 0) {
            await insertBatch(videos);
          }
          console.log(`\n✅ Imported ${rowCount} videos from ${path.basename(filePath)}`);
          resolve(rowCount);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Insert batch of videos
async function insertBatch(videos) {
  try {
    const operations = videos.map(video => ({
      updateOne: {
        filter: { videoId: video.videoId },
        update: { $set: video },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Video.bulkWrite(operations, { ordered: false });
    }
  } catch (error) {
    console.error('Error inserting batch:', error);
  }
}

// Store in HDFS
async function storeInHDFS(filePath, countryCode) {
  try {
    const isEnabled = await hdfsService.isEnabled();
    if (!isEnabled) {
      console.log('⚠️  HDFS is not enabled, skipping HDFS storage');
      return;
    }

    console.log(`\n📦 Storing data in HDFS...`);
    const videos = await Video.find({ countryCode }).limit(10000).lean();
    
    if (videos.length > 0) {
      const date = new Date().toISOString().split('T')[0];
      const hdfsPath = await hdfsService.storeVideoData(videos, date);
      if (hdfsPath) {
        console.log(`✅ Data stored in HDFS: ${hdfsPath}`);
      }
    }
  } catch (error) {
    console.warn('⚠️  HDFS storage failed:', error.message);
  }
}

// Main import function
async function main() {
  try {
    await connectDB();

    // Get dataset path from environment or use default
    const datasetPath = process.env.DATASET_PATH || path.join(__dirname, '..', 'data', 'kaggle');
    
    if (!fs.existsSync(datasetPath)) {
      console.error(`❌ Dataset path not found: ${datasetPath}`);
      console.log('\n💡 Run loadDataset.py first to download the dataset');
      process.exit(1);
    }

    // Find all CSV files
    const csvFiles = [];
    const findCSVFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findCSVFiles(filePath);
        } else if (file.endsWith('.csv')) {
          csvFiles.push(filePath);
        }
      });
    };

    findCSVFiles(datasetPath);

    if (csvFiles.length === 0) {
      console.error(`❌ No CSV files found in: ${datasetPath}`);
      process.exit(1);
    }

    console.log(`\n📊 Found ${csvFiles.length} CSV file(s)`);

    let totalImported = 0;
    for (const csvFile of csvFiles) {
      // Extract country code from filename (e.g., USvideos.csv -> US)
      const filename = path.basename(csvFile, '.csv');
      const countryMatch = filename.match(/^([A-Z]{2})/i);
      const countryCode = countryMatch ? countryMatch[1].toUpperCase() : 'US';

      const count = await importCSVFile(csvFile, countryCode);
      totalImported += count;

      // Store in HDFS
      await storeInHDFS(csvFile, countryCode);
    }

    console.log(`\n✅ Total videos imported: ${totalImported}`);
    console.log('\n🎉 Dataset import completed!');

    // Get statistics
    const totalVideos = await Video.countDocuments();
    const totalViews = await Video.aggregate([
      { $group: { _id: null, total: { $sum: '$statistics.viewCount' } } }
    ]);

    console.log(`\n📈 Database Statistics:`);
    console.log(`   Total Videos: ${totalVideos.toLocaleString()}`);
    if (totalViews[0]) {
      console.log(`   Total Views: ${totalViews[0].total.toLocaleString()}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importCSVFile, main };

