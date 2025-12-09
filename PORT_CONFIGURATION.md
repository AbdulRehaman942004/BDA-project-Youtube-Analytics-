# 🔌 Port Configuration

## Current Port Assignment

| Service | Port | Description |
|---------|------|-------------|
| **MongoDB** | `27017` | Database server (standard MongoDB port) |
| **Backend API** | `5000` | Express.js server |
| **Frontend** | `3000` | React development server |
| **Mongo Express** | `8081` | MongoDB web interface (optional) |

## ✅ Port Verification

All ports are **different** and properly configured:

- ✅ MongoDB: `27017` (Docker container)
- ✅ Backend: `5000` (Node.js/Express)
- ✅ Frontend: `3000` (React)
- ✅ Mongo Express: `8081` (Optional admin UI)

---

## 📝 Configuration Files

### MongoDB Port
**File:** `docker-compose.dev.yml`
```yaml
mongodb:
  ports:
    - "27017:27017"
```

### Backend Port
**File:** `server/src/index.ts`
```typescript
const PORT = process.env.PORT || 5000;
```

**File:** `docker-compose.dev.yml`
```yaml
backend:
  ports:
    - "5000:5000"
  environment:
    PORT: 5000
```

### Frontend Port
**File:** `client/package.json`
```json
"scripts": {
  "start": "react-scripts start"
}
```

React Scripts defaults to port `3000`. To change it:
```json
"start": "PORT=3001 react-scripts start"
```

**File:** `docker-compose.dev.yml`
```yaml
frontend:
  ports:
    - "3000:3000"
```

---

## 🔧 Changing Ports (If Needed)

### Change Backend Port

1. **Update `.env` file:**
   ```env
   PORT=5001
   ```

2. **Update `client/.env`:**
   ```env
   REACT_APP_API_URL=http://localhost:5001/api
   ```

3. **Update `docker-compose.dev.yml`:**
   ```yaml
   backend:
     ports:
       - "5001:5001"
   ```

### Change Frontend Port

1. **Update `client/package.json`:**
   ```json
   "scripts": {
     "start": "PORT=3001 react-scripts start"
   }
   ```

2. **Update `docker-compose.dev.yml`:**
   ```yaml
   frontend:
     ports:
       - "3001:3001"
   ```

### Change MongoDB Port

1. **Update `docker-compose.dev.yml`:**
   ```yaml
   mongodb:
     ports:
       - "27018:27017"
   ```

2. **Update `.env` file:**
   ```env
   MONGODB_URI=mongodb://admin:password123@localhost:27018/youtube_trends?authSource=admin
   ```

---

## ✅ Current Status

**All ports are properly configured and different:**
- ✅ MongoDB: `27017`
- ✅ Backend: `5000`
- ✅ Frontend: `3000`
- ✅ Mongo Express: `8081`

**No conflicts detected!** 🎉

---

## 🧪 Test Ports

```powershell
# Test MongoDB
mongosh "mongodb://localhost:27017/youtube_trends"

# Test Backend
curl http://localhost:5000/api/health

# Test Frontend
# Open browser: http://localhost:3000
```

---

## 📋 Quick Reference

```powershell
# MongoDB
docker ps --filter "name=youtube-trends-mongodb"
# Should show port 27017

# Backend
# Check: http://localhost:5000/api/health

# Frontend
# Check: http://localhost:3000
```

