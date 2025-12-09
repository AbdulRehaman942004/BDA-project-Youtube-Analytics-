# 📊 Dataset Import Guide - Quick Start

This guide will help you download the Kaggle dataset and import it into MongoDB so your frontend can display real data.

## 🎯 Problem Fixed

**Previous Issue:** The dataset was downloaded to Kaggle's cache but not copied to where the import script expected it (`data/kaggle`).

**Solution:** The `loadDataset.py` script now automatically copies CSV files to the correct location.

## 📋 Step-by-Step Instructions

### Step 1: Install Python Dependencies

```powershell
pip install kagglehub pandas
```

### Step 2: Download Dataset

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\data"
python loadDataset.py
```

**What happens:**
- Downloads the YouTube Trending Video Dataset from Kaggle
- Automatically copies all CSV files to `data/kaggle/` folder
- Shows preview of the data

**Expected output:**
```
📥 Downloading YouTube Trending Video Dataset from Kaggle...
📂 Kaggle cache path: C:\Users\...\kaggle\datasets\datasnaek\youtube-new
🔍 Scanning for CSV files...
  ✓ Found: USvideos.csv
  ✓ Found: GBvideos.csv
  ...
📋 Copying X CSV file(s) to data\kaggle...
  ✓ Copied: USvideos.csv
  ...
✅ Successfully copied X file(s)
🎉 Dataset ready for import!
```

### Step 3: Build Server (Required)

The import script needs compiled TypeScript files:

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\server"
npm run build
```

### Step 4: Ensure MongoDB is Running

Make sure MongoDB is running on your system. Check your `.env` file for the connection string:

```env
MONGODB_URI=mongodb://localhost:27017/youtube_trends
```

### Step 5: Import Dataset to MongoDB

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project"
npm run import:dataset
```

**Or directly:**
```powershell
node data/importDataset.js
```

**What happens:**
- Connects to MongoDB
- Reads all CSV files from `data/kaggle/`
- Imports videos in batches of 1000
- Shows progress as it processes
- Calculates trending scores and engagement rates

**Expected output:**
```
✅ MongoDB Connected
📊 Found 10 CSV file(s)
📂 Processing file: USvideos.csv
  Processed: 1000 videos...
  Processed: 2000 videos...
✅ Imported 40881 videos from USvideos.csv
...
✅ Total videos imported: 375942
🎉 Dataset import completed!
```

### Step 6: Verify Import

**Check via API:**
```powershell
curl http://localhost:5000/api/dataset/stats
```

**Or start the backend and check:**
```powershell
cd server
npm run dev
```

Then visit: `http://localhost:5000/api/dataset/stats`

You should see:
```json
{
  "success": true,
  "stats": {
    "totalVideos": 375942,
    "totalViews": 1234567890,
    ...
  }
}
```

### Step 7: View in Frontend

1. **Start the backend** (if not already running):
   ```powershell
   cd server
   npm run dev
   ```

2. **Start the frontend**:
   ```powershell
   cd client
   npm start
   ```

3. **Navigate to Dataset page**: `http://localhost:3000/dataset`

You should now see:
- ✅ Real statistics (total videos, views, likes, comments)
- ✅ Actual video data in the table
- ✅ Charts with real data
- ✅ Country and category filters working

## 🔧 Troubleshooting

### Issue: "Dataset path not found"

**Solution:** Make sure you ran `python loadDataset.py` first. Check that `data/kaggle/` folder exists and contains CSV files.

### Issue: "No CSV files found"

**Solution:** 
- Verify CSV files are in `data/kaggle/` folder
- Check file permissions
- Try re-running `python loadDataset.py`

### Issue: "MongoDB connection failed"

**Solution:**
- Ensure MongoDB is running
- Check `.env` file has correct `MONGODB_URI`
- Test connection: `mongosh "mongodb://localhost:27017/youtube_trends"`

### Issue: "Module not found" errors

**Solution:**
```powershell
cd server
npm run build
```

### Issue: Frontend still shows empty data

**Solution:**
1. Verify backend is running: `http://localhost:5000/api/dataset/stats`
2. Check browser console for errors
3. Ensure `REACT_APP_DEMO` is not set to `'true'` in client `.env`
4. Restart frontend after backend changes

## 📊 What You Get

After successful import:
- **Hundreds of thousands of videos** from multiple countries
- **Real statistics**: views, likes, comments, engagement rates
- **Historical data**: videos from different time periods
- **Multiple countries**: US, GB, CA, DE, etc.
- **Category distribution**: videos across different categories

## 🎉 Success Indicators

- ✅ `data/kaggle/` folder contains CSV files
- ✅ MongoDB has documents in `videos` collection
- ✅ API endpoint `/api/dataset/stats` returns real numbers
- ✅ Frontend Dataset page shows actual video data
- ✅ No "Demo" or mock data visible

## 📝 Notes

- The import process may take 5-15 minutes depending on dataset size
- Progress is shown in the console
- Data is imported in batches to avoid memory issues
- Duplicate videos (same videoId) are updated, not duplicated (upsert)

