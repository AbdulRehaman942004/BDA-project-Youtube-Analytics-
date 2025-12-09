# 🔧 Fix Port 5000 Already in Use Error

## ✅ Quick Fix (Recommended)

### Option 1: Kill the Process Using Port 5000

**Step 1: Find the PID**
```powershell
netstat -ano | findstr :5000
```

**Step 2: Kill the Process**
```powershell
taskkill /PID <PID_NUMBER> /F
```

**Example:**
```powershell
# If PID is 5908
taskkill /PID 5908 /F
```

**Step 3: Verify Port is Free**
```powershell
netstat -ano | findstr :5000
```

Should return nothing (or only UDP which is fine).

---

### Option 2: Use the Helper Script

```powershell
.\scripts\fix-port-5000.ps1
```

This script will:
- Find the process using port 5000
- Show you what it is
- Ask for confirmation before killing it

---

### Option 3: Change Backend Port to 5001

If you prefer to keep the other process running, change your backend port:

**1. Update `server/src/index.ts`:**
```typescript
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001
```

**2. Update `.env` file:**
```env
PORT=5001
```

**3. Update `client/.env` file:**
```env
REACT_APP_API_URL=http://localhost:5001/api
```

**4. Update `docker-compose.dev.yml`:**
```yaml
backend:
  ports:
    - "5001:5001"  # Changed from 5000:5000
  environment:
    PORT: 5001  # Changed from 5000
```

**5. Rebuild and restart:**
```powershell
cd server
npm run build
npm run dev
```

---

## 🔍 What Process is Using Port 5000?

Common culprits:
- Previous instance of your backend (nodemon didn't close properly)
- Another Node.js application
- Python Flask/Django server
- Another development server

---

## ✅ Verify Fix

After killing the process or changing the port:

**Test Backend:**
```powershell
# If using port 5000
curl http://localhost:5000/api/health

# If using port 5001
curl http://localhost:5001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

---

## 🚀 Now Start Your Backend

```powershell
cd server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 YouTube Trends Analytics API is ready!
```

---

## 📝 Prevention

To avoid this in the future:

1. **Always stop servers properly** (Ctrl+C in terminal)
2. **Check for running processes** before starting:
   ```powershell
   netstat -ano | findstr :5000
   ```
3. **Use the helper script** before starting:
   ```powershell
   .\scripts\fix-port-5000.ps1
   ```

---

## 🆘 Still Having Issues?

1. **Restart your terminal** - Sometimes processes don't show up
2. **Restart your PC** - Nuclear option but always works
3. **Use a different port** - Change to 5001, 5002, etc.

---

**✅ Port 5000 should now be free and ready to use!**

