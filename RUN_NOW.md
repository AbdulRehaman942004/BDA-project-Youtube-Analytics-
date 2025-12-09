# 🚀 Run the Project Now - Quick Guide

Since the data is already loaded, follow these steps:

## ✅ Step 1: Verify MongoDB is Running

```powershell
docker ps
```

You should see `youtube-trends-mongodb` with status "Up"

If not running:
```powershell
docker start youtube-trends-mongodb
```

---

## ✅ Step 2: Start Backend Server

**Open a NEW PowerShell terminal** (Terminal 1):

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\server"
npm run dev
```

**Wait for this message:**
```
🚀 Server running on port 5000
📊 YouTube Trends Analytics API is ready!
```

**✅ Keep this terminal open!**

---

## ✅ Step 3: Start Frontend

**Open ANOTHER NEW PowerShell terminal** (Terminal 2):

```powershell
cd "D:\7th semester\Big Data Analytics\BDA project\client"
npm start
```

**Wait for:**
```
Compiled successfully!
Local: http://localhost:3000
```

The browser should automatically open.

**✅ Keep this terminal open too!**

---

## ✅ Step 4: View Real Data

1. **Go to Dataset page:**
   - Click "Dataset" in navigation
   - Or visit: `http://localhost:3000/dataset`
   
   **You should see:**
   - ✅ Real statistics (total videos, views, likes, comments)
   - ✅ Actual video data in the table
   - ✅ Charts with real data

2. **Go to Dashboard page:**
   - Click "Dashboard" in navigation
   - Or visit: `http://localhost:3000/dashboard`
   
   **You should see:**
   - ✅ Real data from your imported dataset
   - ✅ Top videos from MongoDB
   - ✅ Category distribution

---

## 🔍 Verify Everything Works

**Test the API directly:**
```powershell
# In a new terminal
curl http://localhost:5000/api/dataset/stats
```

You should see JSON with real numbers (not zeros).

---

## ⚠️ If Something Doesn't Work

### Backend not starting?
- Check MongoDB is running: `docker ps`
- Check `.env` file has correct `MONGODB_URI`
- Look for error messages in the backend terminal

### Frontend shows "Backend not running"?
- Make sure backend is running in Terminal 1
- Check `http://localhost:5000/api/health` in browser
- Verify `REACT_APP_DEMO=false` in `client/.env`

### No data showing?
- Verify data was imported: Check MongoDB
- Re-import if needed: `npm run import:dataset`

---

## 📝 Summary

**You need 2 terminals running:**

**Terminal 1 (Backend):**
```powershell
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd client
npm start
```

**Then visit:** `http://localhost:3000/dataset`

---

**🎉 You're all set! The real Kaggle dataset data should now be visible on your frontend!**

