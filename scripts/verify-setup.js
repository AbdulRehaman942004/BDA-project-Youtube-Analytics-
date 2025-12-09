const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifySetup() {
  log('\n🔍 Verifying Project Setup...\n', 'blue');

  let allChecksPassed = true;

  // Check 1: Dataset files exist
  log('1. Checking dataset files...', 'blue');
  const datasetPath = path.join(__dirname, '..', 'data', 'kaggle');
  if (fs.existsSync(datasetPath)) {
    const csvFiles = fs.readdirSync(datasetPath).filter(f => f.endsWith('.csv'));
    if (csvFiles.length > 0) {
      log(`   ✅ Found ${csvFiles.length} CSV file(s) in data/kaggle/`, 'green');
    } else {
      log('   ❌ No CSV files found in data/kaggle/', 'red');
      log('   💡 Run: cd data && python loadDataset.py', 'yellow');
      allChecksPassed = false;
    }
  } else {
    log('   ❌ data/kaggle/ folder not found', 'red');
    log('   💡 Run: cd data && python loadDataset.py', 'yellow');
    allChecksPassed = false;
  }

  // Check 2: MongoDB connection
  log('\n2. Checking MongoDB connection...', 'blue');
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube_trends';
  try {
    await mongoose.connect(mongoURI);
    log('   ✅ MongoDB connected successfully', 'green');
    
    // Check 3: Database has data
    log('\n3. Checking database for imported data...', 'blue');
    const Video = mongoose.model('Video', new mongoose.Schema({}, { strict: false }));
    const videoCount = await Video.countDocuments();
    
    if (videoCount > 0) {
      log(`   ✅ Found ${videoCount.toLocaleString()} videos in database`, 'green');
      
      // Get sample statistics
      const sampleStats = await Video.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$statistics.viewCount' },
            avgEngagement: { $avg: '$engagementRate' }
          }
        }
      ]);
      
      if (sampleStats[0]) {
        log(`   ✅ Total views: ${sampleStats[0].totalViews.toLocaleString()}`, 'green');
        log(`   ✅ Avg engagement: ${sampleStats[0].avgEngagement?.toFixed(2) || 0}%`, 'green');
      }
    } else {
      log('   ❌ No videos found in database', 'red');
      log('   💡 Run: npm run import:dataset', 'yellow');
      allChecksPassed = false;
    }
    
    await mongoose.disconnect();
  } catch (error) {
    log('   ❌ MongoDB connection failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('   💡 Make sure MongoDB is running', 'yellow');
    allChecksPassed = false;
  }

  // Check 4: Server build
  log('\n4. Checking server build...', 'blue');
  const distPath = path.join(__dirname, '..', 'server', 'dist');
  if (fs.existsSync(distPath)) {
    const distFiles = fs.readdirSync(distPath);
    if (distFiles.length > 0) {
      log('   ✅ Server build exists', 'green');
    } else {
      log('   ⚠️  Server dist folder is empty', 'yellow');
      log('   💡 Run: cd server && npm run build', 'yellow');
    }
  } else {
    log('   ⚠️  Server dist folder not found', 'yellow');
    log('   💡 Run: cd server && npm run build', 'yellow');
  }

  // Check 5: Environment variables
  log('\n5. Checking environment configuration...', 'blue');
  const requiredEnvVars = ['MONGODB_URI'];
  let envOk = true;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log(`   ✅ ${envVar} is set`, 'green');
    } else {
      log(`   ⚠️  ${envVar} not set (using default)`, 'yellow');
    }
  }

  // Check 6: Client environment
  log('\n6. Checking client configuration...', 'blue');
  const clientEnvPath = path.join(__dirname, '..', 'client', '.env');
  if (fs.existsSync(clientEnvPath)) {
    const clientEnv = fs.readFileSync(clientEnvPath, 'utf8');
    if (clientEnv.includes('REACT_APP_DEMO=false') || !clientEnv.includes('REACT_APP_DEMO=true')) {
      log('   ✅ Client configured to use real API', 'green');
    } else {
      log('   ⚠️  REACT_APP_DEMO is set to true', 'yellow');
      log('   💡 Set REACT_APP_DEMO=false in client/.env', 'yellow');
    }
  } else {
    log('   ⚠️  client/.env not found', 'yellow');
    log('   💡 Create client/.env with: REACT_APP_DEMO=false', 'yellow');
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  if (allChecksPassed) {
    log('✅ All critical checks passed!', 'green');
    log('\n🚀 You can now:', 'blue');
    log('   1. Start backend: cd server && npm run dev', 'blue');
    log('   2. Start frontend: cd client && npm start', 'blue');
    log('   3. Visit: http://localhost:3000/dataset', 'blue');
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
    log('\n📖 See SETUP_COMPLETE.md for detailed instructions', 'yellow');
  }
  log('='.repeat(50) + '\n', 'blue');
  
  process.exit(allChecksPassed ? 0 : 1);
}

verifySetup().catch(error => {
  log(`\n❌ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});

