# 🚀 Quick Start Guide

## ✅ Fixed Issues

The import script has been fixed! The duplicate `path` declaration error is resolved.

## 📋 Prerequisites

Before running the import, make sure:

1. **MongoDB is running**
   - Check if MongoDB service is running
   - Or start MongoDB manually

2. **Dataset is downloaded**
   - Run `python data/loadDataset.py` first
   - Note the dataset path

3. **Server is built**
   - Run `cd server && npm run build`

## 🔧 Start MongoDB

### Option 1: Check if MongoDB is running
```powershell
Get-Service -Name "*mongo*"
```

### Option 2: Start MongoDB Service
```powershell
# If MongoDB is installed as a service
Start-Service MongoDB
```

### Option 3: Start MongoDB Manually
```powershell
# Navigate to MongoDB bin directory
cd "C:\Program Files\MongoDB\Server\7.0\bin"
.\mongod.exe
```

### Option 4: Use Docker (if using docker-compose)
```powershell
docker-compose -f docker-compose.dev.yml up mongodb
```

## 📥 Import Dataset

Once MongoDB is running:

```bash
# From project root
npm run import:dataset
```

## 🎯 Complete Steps

1. **Download Dataset:**
   ```bash
   cd data
   python loadDataset.py
   ```

2. **Start MongoDB:**
   ```powershell
   # Check if running, or start it
   Start-Service MongoDB
   ```

3. **Build Server:**
   ```bash
   cd server
   npm run build
   ```

4. **Import Dataset:**
   ```bash
   # From project root
   npm run import:dataset
   ```

5. **Start Application:**
   ```bash
   npm run dev
   ```

6. **View Dataset:**
   - Open http://localhost:3000
   - Click "Dataset" in navigation

## ⚠️ Common Issues

### MongoDB Connection Refused
- **Solution:** Start MongoDB service
- **Check:** `Get-Service -Name "*mongo*"`

### Module Not Found
- **Solution:** Make sure you're in the project root
- **Check:** `cd "d:\7th semester\Big Data Analytics\BDA project"`

### Dataset Path Not Found
- **Solution:** Set DATASET_PATH in .env file
- **Or:** Place CSV files in `data/kaggle/` folder

## ✅ Success Indicators

You'll know it's working when:
- ✅ MongoDB connects successfully
- ✅ Import script shows "Processing file..."
- ✅ Progress counter increases
- ✅ "Imported X videos" messages appear
- ✅ Script completes without errors

Good luck! 🎉

