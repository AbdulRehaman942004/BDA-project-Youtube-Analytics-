# 🚀 How to Run the Project - Step by Step

Follow these steps **in order** to get your project running with real Kaggle dataset data.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Python 3.x installed (`python --version`)
- ✅ Node.js installed (`node --version`)
- ✅ MongoDB running locally
- ✅ Kaggle account (free) - for dataset download

## 🔧 Step-by-Step Instructions

### Step 1: Install Python Dependencies

Open PowerShell in the project root and run:

```powershell
pip install kagglehub pandas
```

**Expected output:** Packages installed successfully

---

### Step 2: Download the Dataset

```powershell
cd data
python loadDataset.py
```

**What this does:**
- Downloads YouTube Trending Video Dataset from Kaggle
- Copies all CSV files to `data/kaggle/` folder
- Shows preview of the data

**Expected output:**
```
📥 Downloading YouTube Trending Video Dataset from Kaggle...
✅ Successfully copied X file(s) to data\kaggle
🎉 Dataset ready for import!
```

**⏱️ Time:** 2-5 minutes (depending on internet speed)

---

### Step 3: Install Node Dependencies

```powershell
# Go back to project root
cd ..

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

**⏱️ Time:** 2-5 minutes

---

### Step 4: Build the Server

The import script needs compiled TypeScript files:

```powershell
cd server
npm run build
```

**Expected output:**
```
> youtube-trends-analytics-server@1.0.0 build
> tsc
```

**⏱️ Time:** 10-30 seconds

---

### Step 5: Configure Environment Variables

**Create `.env` file in project root** (if it doesn't exist):

```powershell
# In project root
notepad .env
```

Add this content:
```env
MONGODB_URI=mongodb://localhost:27017/youtube_trends
PORT=5000
NODE_ENV=development
REACT_APP_API_URL=http://localhost:5000/api
```

**Create `client/.env` file**:

```powershell
cd client
notepad .env
```

Add this content:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DEMO=false
```

**Important:** `REACT_APP_DEMO=false` ensures you use real data!

---

### Step 6: Ensure MongoDB is Running

**Check if MongoDB is running:**

```powershell
# Test MongoDB connection
mongosh "mongodb://localhost:27017/youtube_trends"
```

If it connects, type `exit` to leave.

**If MongoDB is not running:**
- Start MongoDB service: `net start MongoDB` (Windows)
- Or start MongoDB manually from your installation

---

### Step 7: Import Dataset to MongoDB

```powershell
# Go back to project root
cd ..

# Run import script
npm run import:dataset
```

**What this does:**
- Connects to MongoDB
- Reads all CSV files from `data/kaggle/`
- Imports videos in batches of 1000
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

**⏱️ Time:** 5-15 minutes (depending on dataset size)

---

### Step 8: Verify Setup (Optional)

```powershell
npm run verify:setup
```

This checks:
- ✅ Dataset files exist
- ✅ MongoDB connection works
- ✅ Database has imported videos
- ✅ Server is built
- ✅ Environment configured

---

### Step 9: Start the Backend Server

**Open a new PowerShell terminal** (keep this running):

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\server"
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000
📊 YouTube Trends Analytics API is ready!
🔗 Health check: http://localhost:5000/api/health
```

**✅ Keep this terminal open!** The backend must stay running.

---

### Step 10: Start the Frontend

**Open another new PowerShell terminal**:

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\client"
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view youtube-trends-analytics in the browser.

  Local:            http://localhost:3000
```

The browser should automatically open to `http://localhost:3000`

**✅ Keep this terminal open too!**

---

### Step 11: View Real Data

1. **Navigate to Dataset page:**
   - Click on "Dataset" in the navigation
   - Or go to: `http://localhost:3000/dataset`
   
   **You should see:**
   - ✅ Real statistics (total videos, views, likes, comments)
   - ✅ Actual video data in the table
   - ✅ Charts with real data
   - ✅ Country and category filters working

2. **Navigate to Dashboard page:**
   - Click on "Dashboard" in the navigation
   - Or go to: `http://localhost:3000/dashboard`
   
   **You should see:**
   - ✅ Real data from MongoDB
   - ✅ Top videos from your dataset
   - ✅ Category distribution from real data

---

## 🎯 Quick Command Summary

```powershell
# 1. Download dataset
cd data
python loadDataset.py
cd ..

# 2. Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 3. Build server
cd server
npm run build
cd ..

# 4. Import dataset
npm run import:dataset

# 5. Start backend (Terminal 1)
cd server
npm run dev

# 6. Start frontend (Terminal 2)
cd client
npm start
```

---

## ⚠️ Troubleshooting

### Issue: "Dataset path not found"
**Solution:** Make sure you ran `python loadDataset.py` first. Check that `data/kaggle/` exists.

### Issue: "MongoDB connection failed"
**Solution:** 
- Ensure MongoDB is running
- Check `.env` file has correct `MONGODB_URI`
- Test: `mongosh "mongodb://localhost:27017/youtube_trends"`

### Issue: "Module not found" errors
**Solution:** 
```powershell
cd server
npm run build
```

### Issue: Frontend shows "Backend is not running"
**Solution:**
- Make sure backend is running in Terminal 1
- Check `http://localhost:5000/api/health` in browser
- Verify `REACT_APP_DEMO=false` in `client/.env`

### Issue: Empty statistics (all zeros)
**Solution:**
- Verify import completed: Check MongoDB has videos
- Re-import if needed: `npm run import:dataset`

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Backend shows: "Server running on port 5000"
- ✅ Frontend shows real statistics (not zeros)
- ✅ Dataset page displays actual video titles
- ✅ Charts display real data points
- ✅ No "Demo" or mock data visible

---

## 📝 Notes

- **Keep both terminals open** (backend and frontend)
- The import process takes 5-15 minutes - be patient!
- Progress is shown in console during import
- Data is imported in batches to avoid memory issues

---

**🎉 Once you see real data on the frontend, you're all set!**

