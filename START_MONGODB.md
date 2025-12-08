# 🚀 How to Start MongoDB

## The Problem
Backend is crashing because **MongoDB is not running**.

## Solution: Start Docker Desktop

### Step 1: Start Docker Desktop

1. **Open Docker Desktop** from your Start Menu
   - Search for "Docker Desktop" and click it
   - Wait for Docker Desktop to fully start (whale icon in system tray)

2. **Verify Docker is running:**
   - Look for Docker icon in system tray (bottom right)
   - It should show "Docker Desktop is running"

### Step 2: Start MongoDB Container

Once Docker Desktop is running, open PowerShell and run:

```powershell
docker start youtube-trends-mongodb
```

**Or if container doesn't exist:**

```powershell
docker run -d `
  --name youtube-trends-mongodb `
  -p 27017:27017 `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=password123 `
  -e MONGO_INITDB_DATABASE=youtube_trends `
  mongo:latest
```

### Step 3: Verify MongoDB is Running

```powershell
Test-NetConnection -ComputerName localhost -Port 27017
```

Should show: `TcpTestSucceeded: True`

### Step 4: Backend Will Auto-Restart

Once MongoDB is running:
- The backend (nodemon) will **automatically restart**
- You should see: `✅ MongoDB Connected`
- Then: `🚀 Server running on port 5000`

## Alternative: Install MongoDB Locally

If Docker doesn't work, install MongoDB locally:

1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   ```powershell
   Start-Service MongoDB
   ```

## Quick Checklist

- [ ] Docker Desktop is running
- [ ] MongoDB container is started
- [ ] Port 27017 is accessible
- [ ] Backend shows "MongoDB Connected"

## After MongoDB Starts

Your backend terminal should automatically show:
```
✅ MongoDB Connected
🚀 Server running on port 5000
📊 YouTube Trends Analytics API is ready!
```

Then refresh your frontend browser!

