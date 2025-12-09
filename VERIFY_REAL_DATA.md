# ✅ Verify Real Data is Showing

## 🧪 Test Commands

### Test Dataset Stats (Should Show Real Data)
```powershell
curl http://localhost:5000/api/dataset/stats
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalVideos": 375942,
    "totalViews": 1234567890,
    "totalLikes": 123456789,
    "totalComments": 12345678,
    "countries": 10,
    "categories": 16
  }
}
```

### Test Dashboard (Should Show Real Data)
```powershell
curl http://localhost:5000/api/analytics/dashboard?timeRange=7d
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalVideos": 375942,
      "totalViews": 1234567890,
      "timeRange": "7d"
    },
    "topVideos": [...],
    "categoryStats": [...]
  }
}
```

---

## 🔍 Frontend Verification

### Check Browser Console
1. Open browser: http://localhost:3000
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Look for API requests:
   - Should see: `Making GET request to /api/analytics/dashboard`
   - Should see: `Making GET request to /api/dataset/stats`

### Check Network Tab
1. Go to **Network** tab in Developer Tools
2. Refresh the page
3. Look for requests to:
   - `/api/analytics/dashboard`
   - `/api/dataset/stats`
4. Click on each request
5. Check **Response** tab
6. Verify it contains real data (not "Demo Video Title")

---

## ✅ Signs of Real Data

### Dashboard Page
- ✅ Video titles are actual YouTube video names (not "Demo Video Title 1")
- ✅ Channel names are real (not "Demo Channel 1")
- ✅ Statistics are large numbers (not random small numbers)
- ✅ Category distribution shows real categories

### Dataset Page
- ✅ Total videos shows 375,942+ (not 5,000-10,000)
- ✅ Video table shows actual video titles
- ✅ Charts display real data points
- ✅ Country filters show real country codes (US, GB, CA, etc.)

---

## ❌ Signs of Mock Data

### Dashboard Page
- ❌ Video titles like "Demo Video Title 1", "Demo Video Title 2"
- ❌ Channel names like "Demo Channel 1"
- ❌ Keywords like "keyword_1", "keyword_2"
- ❌ Statistics are small random numbers

### Dataset Page
- ❌ Total videos around 5,000-10,000
- ❌ Error message: "Backend is not running"
- ❌ Empty tables or "No videos found"

---

## 🔧 If Still Seeing Mock Data

1. **Check Backend Logs:**
   - Should see: `✅ MongoDB Connected: localhost`
   - Should NOT see: `❌ Database connection failed`

2. **Check Environment Variables:**
   ```powershell
   # In server directory
   Get-Content ..\.env | Select-String "MONGODB_URI"
   ```
   Should show: `MONGODB_URI=mongodb://admin:password123@localhost:27017/youtube_trends?authSource=admin`

3. **Restart Backend:**
   ```powershell
   # Stop backend (Ctrl+C)
   cd server
   npm run dev
   ```

4. **Clear Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Refresh page

5. **Check Frontend .env:**
   ```powershell
   Get-Content client\.env
   ```
   Should show: `REACT_APP_DEMO=false`

---

## 🎯 Quick Verification Script

```powershell
# Test all endpoints
Write-Output "Testing API endpoints...`n"

# Test health
$health = Invoke-RestMethod "http://localhost:5000/api/health"
Write-Output "Health: $($health.status)"

# Test dataset stats
$stats = Invoke-RestMethod "http://localhost:5000/api/dataset/stats"
Write-Output "Dataset Stats: $($stats.stats.totalVideos) videos"

# Test dashboard
$dashboard = Invoke-RestMethod "http://localhost:5000/api/analytics/dashboard?timeRange=7d"
Write-Output "Dashboard: $($dashboard.data.overview.totalVideos) videos"

Write-Output "`n✅ All endpoints working!"
```

---

**After fixing MongoDB authentication, you should see real data!**

