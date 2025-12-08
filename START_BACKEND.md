# 🚀 How to Start the Backend

## The Problem
Frontend is showing demo data because the **backend is not running**.

## Quick Fix

### Step 1: Open a NEW Terminal/PowerShell Window

**Don't close the frontend terminal!** Open a **separate** terminal window.

### Step 2: Start the Backend

In the **new terminal**, run:

```powershell
cd "d:\7th semester\Big Data Analytics\BDA project\server"
npm run dev
```

### Step 3: Wait for Backend to Start

You should see:
```
🚀 Server running on port 5000
📊 YouTube Trends Analytics API is ready!
✅ MongoDB Connected
```

### Step 4: Refresh Frontend

Go back to your browser and **refresh the page** (F5 or Ctrl+R).

### Step 5: Click "Dataset"

Now the Dataset page should work and show real data!

## Verify Backend is Running

Test in a browser or new terminal:
```
http://localhost:5000/api/health
```

Should return JSON like:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## Troubleshooting

### If backend won't start:

1. **Check MongoDB is running:**
   ```powershell
   docker ps | Select-String mongo
   ```

2. **If MongoDB is not running:**
   ```powershell
   docker start youtube-trends-mongodb
   ```

3. **Check for port conflicts:**
   ```powershell
   netstat -ano | findstr :5000
   ```

4. **Build the server first:**
   ```powershell
   cd server
   npm run build
   npm run dev
   ```

## What You Need Running

✅ **MongoDB** - Database (in Docker)  
✅ **Backend** - Node.js server on port 5000  
✅ **Frontend** - React app on port 3000  

All three must be running for the app to work!

