# ✅ Complete Setup Guide - Real Dataset on Frontend

This guide ensures your project shows **real Kaggle dataset statistics** on the frontend.

## 🔧 Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.x installed
- ✅ Node.js and npm installed
- ✅ MongoDB running locally or accessible
- ✅ Kaggle account (free) for dataset download

## 📋 Step-by-Step Setup

### Step 1: Install Python Dependencies

```powershell
pip install kagglehub pandas
```

### Step 2: Download Dataset

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\data"
python loadDataset.py
```

**Expected output:**
```
📥 Downloading YouTube Trending Video Dataset from Kaggle...
✅ Successfully copied X file(s) to data\kaggle
🎉 Dataset ready for import!
```

### Step 3: Configure Environment Variables

**Create `.env` file in project root** (if not exists):

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/youtube_trends

# Server Configuration
PORT=5000
NODE_ENV=development

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Optional: YouTube API (for real-time trending)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

**Create `client/.env` file** (if not exists):

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DEMO=false
```

> **Important:** Set `REACT_APP_DEMO=false` to use real data!

### Step 4: Build Server

The import script needs compiled TypeScript:

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\server"
npm install
npm run build
```

### Step 5: Import Dataset to MongoDB

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project"
npm run import:dataset
```

**This will:**
- Connect to MongoDB
- Read all CSV files from `data/kaggle/`
- Import videos in batches
- Calculate trending scores and engagement rates
- Show progress

**Expected output:**
```
✅ MongoDB Connected
📊 Found 10 CSV file(s)
✅ Imported 375942 videos
🎉 Dataset import completed!
```

### Step 6: Verify Import

**Test the API directly:**
```powershell
curl http://localhost:5000/api/dataset/stats
```

Or open in browser: `http://localhost:5000/api/dataset/stats`

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

### Step 7: Start Backend Server

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\server"
npm run dev
```

**Wait for:**
```
🚀 Server running on port 5000
📊 YouTube Trends Analytics API is ready!
```

### Step 8: Start Frontend

**In a new terminal:**
```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\client"
npm install
npm start
```

The frontend will open at `http://localhost:3000`

### Step 9: Verify Real Data on Frontend

1. **Navigate to Dataset page**: `http://localhost:3000/dataset`
2. **Check for:**
   - ✅ Real statistics (total videos, views, likes, comments)
   - ✅ Actual video data in the table
   - ✅ Charts with real data
   - ✅ Country and category filters working
   - ✅ No "Demo" labels

3. **Navigate to Dashboard page**: `http://localhost:3000/dashboard`
   - ✅ Should show real data from MongoDB
   - ✅ Top videos from your dataset
   - ✅ Category distribution from real data

## 🎯 Success Indicators

You'll know it's working when:

- ✅ `data/kaggle/` folder contains CSV files
- ✅ MongoDB has documents in `videos` collection
- ✅ API endpoint returns real numbers (not zeros)
- ✅ Frontend shows actual video titles and statistics
- ✅ No mock/demo data visible
- ✅ Charts display real data points

## 🔍 Troubleshooting

### Issue: Frontend shows "No videos found"

**Check:**
1. Backend is running: `http://localhost:5000/api/dataset/stats`
2. MongoDB has data: Check `videos` collection
3. `REACT_APP_DEMO=false` in `client/.env`
4. Browser console for errors

### Issue: "Backend is not running" error

**Solution:**
1. Start backend: `cd server && npm run dev`
2. Wait for "Server running on port 5000"
3. Refresh frontend

### Issue: Empty statistics (all zeros)

**Solution:**
1. Verify import completed successfully
2. Check MongoDB: `mongosh "mongodb://localhost:27017/youtube_trends"`
3. Run: `db.videos.countDocuments()` (should be > 0)
4. Re-import if needed: `npm run import:dataset`

### Issue: Demo data still showing

**Solution:**
1. Check `client/.env`: `REACT_APP_DEMO=false`
2. Restart frontend: Stop (Ctrl+C) and `npm start` again
3. Clear browser cache

## 📊 What Each Page Shows

### Dataset Page (`/dataset`)
- **Source:** `/api/dataset/*` endpoints
- **Data:** Direct from MongoDB (Kaggle dataset)
- **Always uses real data** (even in demo mode)

### Dashboard Page (`/dashboard`)
- **Source:** `/api/analytics/dashboard` endpoint
- **Data:** From MongoDB (filtered by date range)
- **Uses real data** when backend is running

### Trending Videos Page (`/trending`)
- **Source:** `/api/youtube/trending` endpoint
- **Data:** YouTube API (requires API key) or MongoDB
- **Uses real data** when backend is running

## 🚀 Quick Start Commands

```powershell
# 1. Download dataset
cd data && python loadDataset.py

# 2. Build server
cd ..\server && npm run build

# 3. Import to MongoDB
cd .. && npm run import:dataset

# 4. Start backend (Terminal 1)
cd server && npm run dev

# 5. Start frontend (Terminal 2)
cd client && npm start
```

## 📝 Notes

- The import process takes 5-15 minutes depending on dataset size
- Progress is shown in console during import
- Data is imported in batches to avoid memory issues
- Duplicate videos are updated (upsert), not duplicated
- The analytics dashboard will show all data if date range returns empty

## ✅ Final Checklist

Before considering setup complete:

- [ ] Dataset downloaded to `data/kaggle/`
- [ ] MongoDB has videos (check count > 0)
- [ ] Backend server running on port 5000
- [ ] Frontend shows real statistics
- [ ] Dataset page displays actual videos
- [ ] Dashboard shows real data
- [ ] No demo/mock data visible
- [ ] Charts display real data points

---

**You're all set!** Your frontend should now display real Kaggle dataset statistics! 🎉

