# 🚀 Quick Reference - Real Dataset Setup

## ⚡ Quick Commands

```powershell
# 1. Download dataset
cd data && python loadDataset.py

# 2. Build server
cd ..\server && npm run build

# 3. Import to MongoDB
cd .. && npm run import:dataset

# 4. Verify setup
npm run verify:setup

# 5. Start backend (Terminal 1)
cd server && npm run dev

# 6. Start frontend (Terminal 2)  
cd client && npm start
```

## ✅ Verification Checklist

Run `npm run verify:setup` to check:
- ✅ Dataset files exist in `data/kaggle/`
- ✅ MongoDB connection works
- ✅ Database has imported videos
- ✅ Server is built
- ✅ Environment variables configured

## 🔧 Key Files Modified

1. **`data/loadDataset.py`** - Now copies CSV files to `data/kaggle/`
2. **`data/importDataset.js`** - Improved date parsing for Kaggle format
3. **`server/src/routes/analytics.ts`** - Handles historical data better
4. **`client/src/pages/Dashboard.tsx`** - Better error messages

## 📁 Important Locations

- **Dataset files:** `data/kaggle/*.csv`
- **Import script:** `data/importDataset.js`
- **Backend API:** `http://localhost:5000/api`
- **Frontend:** `http://localhost:3000`

## 🎯 Frontend Pages

- **`/dataset`** - Always uses real data from MongoDB
- **`/dashboard`** - Uses real data when backend is running
- **`/trending`** - Uses YouTube API or MongoDB data

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| No CSV files | Run `python data/loadDataset.py` |
| Empty database | Run `npm run import:dataset` |
| Backend not running | `cd server && npm run dev` |
| Demo data showing | Set `REACT_APP_DEMO=false` in `client/.env` |
| Empty statistics | Check MongoDB has data: `db.videos.countDocuments()` |

## 📚 Full Documentation

- **Complete Setup:** See `SETUP_COMPLETE.md`
- **Import Guide:** See `DATASET_IMPORT_GUIDE.md`
- **Troubleshooting:** See `FIX_DEMO_MODE.md`

