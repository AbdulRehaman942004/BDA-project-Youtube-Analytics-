# Dataset Setup and Integration Guide

## 🎯 Complete Integration Steps

This guide will help you set up the Kaggle YouTube Trending Video Dataset and integrate it with your project.

## Step 1: Download the Dataset

### Option A: Using Python Script (Recommended)

1. **Install dependencies:**
   ```bash
   pip install kagglehub[pandas-datasets]
   ```

2. **Run the download script:**
   ```bash
   cd data
   python loadDataset.py
   ```

   This will download the dataset to your system. The path will be printed.

3. **Note the dataset path** - You'll need this for the import step.

### Option B: Manual Download

1. Go to https://www.kaggle.com/datasets/datasnaek/youtube-new
2. Sign in to Kaggle (free account)
3. Download the dataset
4. Extract to `data/kaggle/` folder

## Step 2: Build the Server

The import script needs compiled TypeScript files:

```bash
cd server
npm run build
```

## Step 3: Install Import Dependencies

```bash
# Make sure csv-parser is installed in server
cd server
npm install csv-parser
```

## Step 4: Import Dataset to MongoDB

1. **Set the dataset path** (if different from default):
   ```bash
   # In .env file, add:
   DATASET_PATH=C:\path\to\downloaded\dataset
   ```

2. **Run the import script:**
   ```bash
   npm run import:dataset
   ```

   Or directly:
   ```bash
   node data/importDataset.js
   ```

3. **Wait for import to complete** - This may take several minutes depending on dataset size.

## Step 5: Verify Import

1. **Check MongoDB:**
   - Connect to MongoDB
   - Check `youtube_trends` database
   - Verify `videos` collection has data

2. **Check via API:**
   ```bash
   curl http://localhost:5000/api/dataset/stats
   ```

3. **Check Frontend:**
   - Start the application: `npm run dev`
   - Navigate to `/dataset` page
   - You should see statistics and videos

## Step 6: Enable HDFS Storage (Optional)

1. **Set HDFS environment variables** in `.env`:
   ```env
   HDFS_ENABLED=true
   HDFS_HOST=localhost
   HDFS_PORT=9870
   HDFS_USER=hadoop
   HDFS_BASE_PATH=/youtube-trends
   ```

2. **Start Hadoop** (if you have it installed)

3. **Re-run import** - Data will be stored in HDFS automatically:
   ```bash
   npm run import:dataset
   ```

## 📊 Dataset Structure

The dataset typically contains:
- **Multiple CSV files** (one per country):
  - `USvideos.csv`
  - `GBvideos.csv`
  - `CAvideos.csv`
  - etc.

- **Each file contains:**
  - Video ID, title, description
  - Channel information
  - View counts, likes, comments
  - Trending dates
  - Category IDs
  - Tags

## 🔧 Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
cd server
npm run build
```

### Issue: "MongoDB connection failed"

**Solution:**
- Ensure MongoDB is running
- Check `.env` file has correct `MONGODB_URI`
- Test connection: `mongosh "mongodb://localhost:27017/youtube_trends"`

### Issue: "No CSV files found"

**Solution:**
- Check dataset path is correct
- Verify CSV files exist in the path
- Check file permissions

### Issue: Import is slow

**Solution:**
- This is normal for large datasets
- The script processes in batches of 1000
- Progress is shown in console

### Issue: HDFS storage fails

**Solution:**
- This is optional - the system works without HDFS
- Set `HDFS_ENABLED=false` to disable
- Or set up Hadoop properly

## 📈 What You Get

After successful import:

1. **Backend API Endpoints:**
   - `GET /api/dataset/stats` - Dataset statistics
   - `GET /api/dataset/videos` - Get videos with filters
   - `GET /api/dataset/countries` - List of countries
   - `GET /api/dataset/categories` - Category distribution
   - `GET /api/dataset/timeline` - Videos over time

2. **Frontend Pages:**
   - `/dataset` - Dataset analytics page
   - Shows statistics, charts, and video table
   - Filtering and search capabilities

3. **HDFS Storage:**
   - Data automatically stored in HDFS (if enabled)
   - Organized by date
   - Accessible via HDFS UI

## 🎉 Success Indicators

You'll know it's working when:

✅ Import script completes without errors  
✅ MongoDB has videos in `videos` collection  
✅ API returns data: `curl http://localhost:5000/api/dataset/stats`  
✅ Frontend `/dataset` page shows statistics  
✅ Videos are displayed in the table  

## 🚀 Next Steps

1. **Explore the data:**
   - Use the frontend to filter and search
   - Check different countries
   - Analyze trends over time

2. **Run analytics:**
   - Use existing analytics endpoints
   - Create custom queries
   - Generate reports

3. **Demonstrate to your teacher:**
   - Show dataset statistics
   - Show HDFS integration
   - Show analytics capabilities
   - Show big data processing

## 📝 Notes

- The dataset is large (~200MB compressed, 1.5GB+ uncompressed)
- Import may take 10-30 minutes depending on your system
- MongoDB will grow significantly after import
- HDFS storage is optional but recommended for Big Data Analytics course

