# 📊 Frontend Data Flow Analysis

## 🔍 What Data is Being Fetched

### Dashboard Page (`/dashboard`)
**API Endpoint:** `GET /api/analytics/dashboard?timeRange=7d`

**What it fetches:**
- `overview.totalVideos` - Total videos count
- `overview.totalViews` - Total views
- `overview.timeRange` - Time range label
- `topVideos[]` - Array of top 10 videos with:
  - `title`, `channelTitle`
  - `statistics.viewCount`, `statistics.likeCount`, `statistics.commentCount`
- `topChannels[]` - Array of top 10 channels
- `categoryStats[]` - Category distribution
- `engagementStats` - Average, max, min engagement rates
- `trendingKeywords[]` - Trending keywords

**Current Issue:** This endpoint is being **mocked** because:
1. Backend might not be running
2. Backend can't connect to MongoDB (authentication issue)
3. API service falls back to mock data

---

### Dataset Page (`/dataset`)
**API Endpoints:**
- `GET /api/dataset/stats` - Dataset statistics
- `GET /api/dataset/videos` - Video list with pagination
- `GET /api/dataset/countries` - Country list
- `GET /api/dataset/categories` - Category distribution
- `GET /api/dataset/timeline` - Timeline data

**What it fetches:**
- `stats.totalVideos` - Total videos in database
- `stats.totalViews` - Total views
- `stats.totalLikes` - Total likes
- `stats.totalComments` - Total comments
- `stats.countries` - Number of countries
- `stats.categories` - Number of categories
- `videos[]` - Array of video objects with full details

**Status:** These endpoints **always use real API** (even in demo mode)

---

## 🔧 Current Problem

### Issue 1: MongoDB Authentication
**Error:** `Command aggregate requires authentication`

**Cause:** Backend can't authenticate with MongoDB

**Solution:** 
1. ✅ `.env` file has correct `MONGODB_URI` with authentication
2. ⚠️ Backend needs to be restarted to pick up environment variables

### Issue 2: Dashboard Using Mock Data
**Cause:** `/analytics/dashboard` endpoint is mocked when:
- Backend is not running
- Backend returns an error
- `IS_DEMO_MODE` is true (but it's false)

**Solution:** Fix MongoDB connection, then Dashboard will use real data

---

## ✅ Fix Steps

### Step 1: Restart Backend Server
```powershell
# Stop current backend (Ctrl+C in terminal)
# Then restart:
cd server
npm run dev
```

### Step 2: Verify MongoDB Connection
Check backend logs for:
```
✅ MongoDB Connected: localhost
```

### Step 3: Test API Endpoints
```powershell
# Test dataset stats (should work)
curl http://localhost:5000/api/dataset/stats

# Test dashboard (should work after MongoDB fix)
curl http://localhost:5000/api/analytics/dashboard?timeRange=7d
```

### Step 4: Verify Frontend
1. Open browser console (F12)
2. Check Network tab for API calls
3. Look for requests to `/api/analytics/dashboard` and `/api/dataset/stats`
4. Verify responses contain real data (not mock)

---

## 📋 API Endpoint Summary

| Page | Endpoint | Uses Real API? | Status |
|------|----------|----------------|--------|
| Dashboard | `/api/analytics/dashboard` | ✅ Yes (when backend works) | ⚠️ Needs MongoDB fix |
| Dataset | `/api/dataset/stats` | ✅ Always | ✅ Should work |
| Dataset | `/api/dataset/videos` | ✅ Always | ✅ Should work |
| Trending | `/api/youtube/trending` | ⚠️ Only if backend works | ⚠️ Needs backend |
| Search | `/api/youtube/search` | ⚠️ Only if backend works | ⚠️ Needs backend |

---

## 🎯 Expected Behavior After Fix

### Dashboard Page
- ✅ Shows real video count from MongoDB
- ✅ Shows real views, likes, comments
- ✅ Displays actual video titles (not "Demo Video Title")
- ✅ Shows real channel names

### Dataset Page
- ✅ Shows real statistics (375,942+ videos)
- ✅ Displays actual video data
- ✅ Charts show real data points
- ✅ Filters work with real data

---

## 🔍 Debugging Checklist

- [ ] Backend is running on port 5000
- [ ] MongoDB is running in Docker
- [ ] `.env` file has correct `MONGODB_URI` with auth
- [ ] Backend logs show "MongoDB Connected"
- [ ] API endpoints return real data (test with curl)
- [ ] Frontend `.env` has `REACT_APP_DEMO=false`
- [ ] Browser console shows API requests
- [ ] Network tab shows successful API responses

---

**Next Step:** Restart the backend server to fix MongoDB authentication!

