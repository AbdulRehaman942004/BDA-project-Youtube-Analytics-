# Fix: Frontend Showing Demo Data

## Issue
Frontend is showing demo/mock data instead of real data from the backend.

## Solution

### Option 1: Ensure Backend is Running (Recommended)

1. **Check if backend is running:**
   ```powershell
   # Open a new terminal and run:
   cd "d:\7th semester\Big Data Analytics\BDA project\server"
   npm run dev
   ```

2. **Wait for backend to start** (you'll see):
   ```
   🚀 Server running on port 5000
   📊 YouTube Trends Analytics API is ready!
   ```

3. **Refresh the frontend** (http://localhost:3000)

### Option 2: Disable Demo Mode Explicitly

Create or update `.env` file in the **client** folder:

```env
REACT_APP_DEMO=false
REACT_APP_API_URL=http://localhost:5000/api
```

Then restart the frontend:
```powershell
# Stop frontend (Ctrl+C)
# Then restart:
cd client
npm start
```

### Option 3: Check Backend Connection

1. **Test backend directly:**
   ```powershell
   curl http://localhost:5000/api/dataset/stats
   ```

2. **If it works**, the frontend should connect automatically.

3. **If it doesn't work**, start the backend first.

## Quick Fix Steps

1. **Start Backend** (in a separate terminal):
   ```powershell
   cd "d:\7th semester\Big Data Analytics\BDA project\server"
   npm run dev
   ```

2. **Wait 10-15 seconds** for backend to start

3. **Refresh frontend** at http://localhost:3000

4. **Navigate to Dataset page** - you should see real data!

## Verify It's Working

- ✅ Backend shows: "Server running on port 5000"
- ✅ Frontend shows real statistics (375,942 videos)
- ✅ Dataset page shows actual video data
- ✅ No "Demo" labels in the data

## Note

The frontend automatically uses real API when:
- `REACT_APP_DEMO` is not set to 'true'
- Backend is running on http://localhost:5000
- API endpoints are accessible

The demo mode is only used when backend is unavailable or explicitly enabled.

