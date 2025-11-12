# Dataset Suggestions for YouTube Trending Video Analytics

This document provides suggestions for datasets that can be used with this YouTube Trending Video Analytics project.

## Recommended Datasets

### 1. **Kaggle - YouTube Trending Video Dataset**
- **Source**: [Kaggle - YouTube Trending Video Dataset](https://www.kaggle.com/datasets/datasnaek/youtube-new)
- **Description**: Contains daily trending video data from multiple countries
- **Size**: ~1.5GB+ (varies by country)
- **Format**: CSV files
- **Features**:
  - Video metadata (title, description, tags, category)
  - Statistics (views, likes, dislikes, comments)
  - Channel information
  - Trending dates
  - Multiple countries (US, GB, CA, DE, etc.)
- **Why it's perfect**: 
  - Real-world data from YouTube
  - Multiple countries for comparative analysis
  - Historical data spanning several years
  - Already structured and clean

### 2. **Kaggle - YouTube Statistics Dataset**
- **Source**: [Kaggle - YouTube Statistics](https://www.kaggle.com/datasets/advaypatil/youtube-statistics)
- **Description**: Comprehensive YouTube video statistics
- **Size**: ~500MB
- **Format**: CSV
- **Features**:
  - Video performance metrics
  - Channel statistics
  - Engagement metrics
  - Category breakdowns

### 3. **Data.world - YouTube Trending Videos**
- **Source**: [Data.world](https://data.world/datasets/youtube)
- **Description**: Various YouTube datasets including trending videos
- **Size**: Varies
- **Format**: CSV, JSON
- **Features**: Multiple datasets with different focuses

### 4. **GitHub - YouTube Data Collections**
- **Source**: Various GitHub repositories
- **Description**: Community-collected YouTube data
- **Format**: JSON, CSV
- **Example**: Search for "youtube trending dataset" on GitHub

### 5. **Academic Datasets**
- **Source**: Research papers and academic repositories
- **Description**: Curated datasets for research purposes
- **Format**: Various
- **Features**: Often include additional metadata and annotations

## How to Use These Datasets

### Option 1: Direct CSV/JSON Import
1. Download the dataset
2. Place it in the `data/` folder
3. Use the data import functionality (if available)
4. Or manually import using MongoDB tools

### Option 2: API Integration (Current Implementation)
- The project currently uses YouTube Data API v3
- You can fetch trending videos in real-time
- Data is automatically stored in MongoDB and HDFS

### Option 3: Batch Import Script
Create a script to import historical data from CSV/JSON files:

```javascript
// Example: scripts/importDataset.js
const csv = require('csv-parser');
const fs = require('fs');
const Video = require('../server/src/models/Video');

// Read and import CSV data
fs.createReadStream('data/youtube-trending.csv')
  .pipe(csv())
  .on('data', async (row) => {
    // Transform and save to MongoDB
    // Also store in HDFS
  });
```

## Recommended Dataset for This Project

**Best Choice: Kaggle YouTube Trending Video Dataset**

**Why:**
1. ✅ Large volume of data (perfect for Big Data Analytics)
2. ✅ Multiple countries (enables geographic analysis)
3. ✅ Historical data (trend analysis over time)
4. ✅ Real-world data (authentic YouTube trends)
5. ✅ Well-structured (easy to import)
6. ✅ Free and publicly available

**How to Get Started:**
1. Sign up for Kaggle (free)
2. Download the dataset: https://www.kaggle.com/datasets/datasnaek/youtube-new
3. Extract CSV files to `data/kaggle/` folder
4. Use the import script to load into MongoDB
5. Data will automatically be stored in HDFS when enabled

## Data Structure Example

The dataset typically includes:
- `video_id`: Unique video identifier
- `trending_date`: Date when video was trending
- `title`: Video title
- `channel_title`: Channel name
- `category_id`: Video category
- `publish_time`: When video was published
- `tags`: Video tags
- `views`: View count
- `likes`: Like count
- `dislikes`: Dislike count
- `comment_count`: Number of comments
- `thumbnail_link`: Thumbnail URL
- `comments_disabled`: Boolean
- `ratings_disabled`: Boolean
- `video_error_or_removed`: Boolean
- `description`: Video description

## Integration with HDFS

Once you have the dataset:
1. Enable HDFS in `.env` file: `HDFS_ENABLED=true`
2. Import data using the import script
3. Data will be automatically stored in HDFS at:
   - `/youtube-trends/videos/{date}/trending_videos_{date}_{timestamp}.json`
   - `/youtube-trends/analytics/{date}/analytics_{date}_{timestamp}.json`

## Additional Resources

- **YouTube Data API Documentation**: https://developers.google.com/youtube/v3
- **Hadoop HDFS Documentation**: https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html
- **MongoDB Import Tools**: https://docs.mongodb.com/database-tools/

## Notes

- Ensure you comply with YouTube's Terms of Service when using datasets
- Some datasets may require attribution
- Large datasets are perfect for demonstrating Big Data Analytics capabilities
- HDFS integration allows for scalable storage of large datasets

