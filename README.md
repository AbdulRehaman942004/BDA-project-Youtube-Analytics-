# YouTube Trends Analytics

A comprehensive analytics platform for analyzing YouTube trending video data from Kaggle dataset.

## 🚀 Features

- **Real-time Data Analysis**: Track trending videos, channels, and topics
- **Interactive Dashboard**: Beautiful, responsive UI for data visualization
- **Trend Detection**: Identify emerging patterns and viral content
- **Historical Analysis**: Compare trends over time
- **MongoDB Integration**: Scalable data storage and retrieval

## 🏗️ Project Structure

```
youtube-trends-analytics/
├── client/                 # React frontend
├── server/                 # Node.js/Express backend
├── data/                   # Dataset files and import scripts
├── scripts/                # Utility scripts
└── docs/                   # Project documentation
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Material-UI, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Dataset**: Kaggle YouTube Trending Video Dataset

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (via Docker or local installation)
- Python 3 (for dataset download script)

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Start MongoDB (Docker)

```powershell
docker-compose up -d mongodb
```

This will start MongoDB on `localhost:27017` with:
- Username: `admin`
- Password: `password123`
- Database: `youtube_trends`

### 3. Download and Import Dataset

```powershell
# Download dataset from Kaggle (requires Kaggle API setup)
python data\loadDataset.py

# Import dataset to MongoDB
node data\importDataset.js
```

### 4. Start Backend

```powershell
cd server
$env:MONGODB_URI="mongodb://admin:password123@localhost:27017/youtube_trends?authSource=admin"
$env:PORT="5000"
npm run dev
```

Backend will run on `http://localhost:5000`

### 5. Start Frontend

```powershell
cd client
$env:REACT_APP_API_URL="http://localhost:5000/api"
$env:REACT_APP_DEMO="false"
npm start
```

Frontend will run on `http://localhost:3000`

## 📚 Documentation

- [Dataset Import Guide](DATASET_IMPORT_GUIDE.md) - Detailed instructions for importing the Kaggle dataset
- [API Documentation](docs/API.md) - Backend API endpoints
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` in `server/` directory):
```
MONGODB_URI=mongodb://admin:password123@localhost:27017/youtube_trends?authSource=admin
PORT=5000
NODE_ENV=development
```

**Frontend** (set as environment variables):
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DEMO=false
```

## 📊 Dataset

This project uses the [Kaggle YouTube Trending Video Dataset](https://www.kaggle.com/datasets/datasnaek/youtube-new). The dataset includes:
- 184,287+ trending videos
- Multiple countries (US, GB, CA, DE, FR, IN, JP, KR, MX, RU)
- Video metadata, statistics, and trending information

## 🐳 Docker

Only MongoDB runs in Docker. All other services (backend, frontend) run locally for development.

To start MongoDB:
```powershell
docker-compose up -d mongodb
```

To stop MongoDB:
```powershell
docker-compose down
```

## 📝 License

MIT
