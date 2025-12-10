# YouTube Trends Analytics

A comprehensive analytics platform for analyzing YouTube trending video data from Kaggle dataset. Built with React, Node.js, Express, and MongoDB, fully containerized with Docker.

## 🚀 Features

- **Real-time Data Analysis**: Track trending videos, channels, and topics
- **Interactive Dashboard**: Beautiful, responsive UI with Material-UI components
- **Performance Optimized**: In-memory caching reduces load times by 98% (25-30s → <0.5s)
- **Category Mapping**: Human-readable category names instead of numeric IDs
- **Trend Detection**: Identify emerging patterns and viral content
- **Historical Analysis**: Compare trends over time with customizable date ranges
- **Advanced Search**: Search videos by keywords, channels, or topics
- **MongoDB Integration**: Scalable data storage with optimized indexes
- **Fully Dockerized**: Run entire stack with a single command

## 🏗️ Project Structure

```
youtube-trends-analytics/
├── client/                 # React frontend (TypeScript)
│   ├── src/
│   │   ├── pages/         # Dashboard, Analytics, Search, etc.
│   │   ├── components/    # Reusable UI components
│   │   ├── services/      # API client with caching
│   │   └── utils/         # Utilities (cache, category mapper)
│   ├── Dockerfile         # Frontend container
│   └── nginx.conf         # Nginx configuration
├── server/                 # Node.js/Express backend (TypeScript)
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # MongoDB models
│   │   ├── utils/         # Utilities (cache, category mapper)
│   │   └── config/        # Database configuration
│   └── Dockerfile         # Backend container
├── data/                   # Dataset files and import scripts
│   ├── kaggle/            # CSV files from Kaggle
│   ├── categories.json    # YouTube category mapping
│   └── importDataset.js   # MongoDB import script
├── scripts/                # Utility scripts
├── docker-compose.yml      # Docker orchestration
└── docs/                   # Project documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **Recharts** for data visualization
- **Axios** for API calls with caching
- **React Router** for navigation

### Backend
- **Node.js 18** with TypeScript
- **Express.js** REST API
- **Mongoose** for MongoDB ODM
- **In-memory caching** for performance

### Database
- **MongoDB 7.0** with optimized indexes
- **Mongoose** for schema management

### DevOps
- **Docker** & **Docker Compose** for containerization
- **Nginx** for frontend serving and API proxying

## 📋 Prerequisites

- **Docker Desktop** (recommended) or
- **Node.js 18+** and **npm** (for local development)
- **MongoDB** (via Docker or local installation)
- **Python 3** (optional, for dataset download script)

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd youtube-trends-analytics
```

### 2. Start All Services

```bash
docker-compose up --build
```

This will:
- Start MongoDB on port `27017`
- Build and start backend on port `5000`
- Build and start frontend on port `3000`

### 3. Import Dataset

After services are running, import the dataset:

```bash
# Make sure MongoDB is running
docker-compose ps

# Import dataset (requires Node.js locally)
node data/importDataset.js
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### 5. Stop Services

```bash
docker-compose down
```

To remove volumes (⚠️ deletes database data):
```bash
docker-compose down -v
```

## 🔧 Local Development (Without Docker)

### 1. Install Dependencies

```bash
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

```bash
docker-compose up -d mongodb
```

MongoDB will run on `localhost:27017` with:
- Username: `admin`
- Password: `password123`
- Database: `youtube_trends`

### 3. Import Dataset

```bash
# Download dataset from Kaggle (optional, if not already present)
python data/loadDataset.py

# Import dataset to MongoDB
node data/importDataset.js
```

### 4. Start Backend

```bash
cd server
npm run dev
```

Backend will run on `http://localhost:5000`

### 5. Start Frontend

```bash
cd client
npm start
```

Frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Dashboard Analytics
```
GET /api/analytics/dashboard?timeRange=7d
```
Query parameters: `timeRange` (1d, 7d, 30d, 90d)

### Trending Videos
```
GET /api/youtube/trending?regionCode=US&maxResults=50
```

### Search Videos
```
GET /api/youtube/search?q=comedy&maxResults=25&order=relevance
```

### Dataset Statistics
```
GET /api/dataset/stats
GET /api/dataset/videos?page=1&limit=50&categoryId=22
```

See [docs/API.md](docs/API.md) for complete API documentation.

## ⚙️ Configuration

### Docker Environment Variables

Environment variables are set in `docker-compose.yml`:

**Backend:**
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Backend server port (default: 5000)
- `NODE_ENV`: Environment mode (production)

**Frontend:**
- `REACT_APP_API_URL`: Backend API URL (set to `/api` for Docker)

### Local Development Environment Variables

Create a `.env` file in the `server/` directory:

```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/youtube_trends?authSource=admin
PORT=5000
NODE_ENV=development
```

For frontend, set environment variables:
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 Dataset

This project uses the [Kaggle YouTube Trending Video Dataset](https://www.kaggle.com/datasets/datasnaek/youtube-new).

### Dataset Information
- **184,287+** trending videos
- **10 countries**: US, GB, CA, DE, FR, IN, JP, KR, MX, RU
- **Video metadata**: Title, description, channel info, statistics
- **Trending data**: Trending dates, scores, engagement rates
- **Categories**: 15+ video categories with names

### Import Process

1. Download CSV files from Kaggle to `data/kaggle/`
2. Run import script: `node data/importDataset.js`
3. Script will:
   - Parse CSV files
   - Calculate trending scores and engagement rates
   - Import to MongoDB with indexes
   - Show progress and statistics

## 🐳 Docker Details

### Services

- **mongodb**: MongoDB 7.0 database
- **backend**: Node.js/Express API server
- **frontend**: React app served by Nginx

### Networking

All services communicate via Docker network `youtube-trends-network`. Frontend uses Nginx to proxy `/api` requests to the backend.

### Volumes

- `mongodb_data`: Persistent MongoDB data storage
- `./data:/app/data:ro`: Read-only mount for categories.json

### Health Checks

All services include health checks:
- MongoDB: Ping test
- Backend: HTTP health endpoint
- Frontend: Nginx availability

## 🚀 Performance Features

### Caching System

- **Backend**: In-memory cache with TTL (2-15 minutes based on timeRange)
- **Frontend**: localStorage cache matching backend TTL
- **Result**: 98% faster load times for cached requests (<0.5s vs 25-30s)

### Database Optimization

- **Indexes**: Optimized indexes on trendingScore, categoryId, publishedAt, etc.
- **Aggregations**: Optimized MongoDB aggregation pipelines
- **allowDiskUse**: Enabled for large dataset operations

## 📖 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment

## 🛠️ Development

### Available Scripts

**Root:**
```bash
npm run dev          # Run both server and client concurrently
npm run import:dataset  # Import dataset to MongoDB
```

**Server:**
```bash
npm run dev          # Start with nodemon (auto-reload)
npm run build        # Build TypeScript
npm start            # Start production server
```

**Client:**
```bash
npm start            # Start development server
npm run build        # Build for production
```

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Kill process or change port in docker-compose.yml
```

### Docker Issues

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild specific service
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

## 📝 Recent Updates

- ✅ Full Docker containerization
- ✅ Performance optimization with caching (98% faster)
- ✅ Category name mapping (human-readable names)
- ✅ Enhanced dashboard with 10 trending videos
- ✅ 20 trending keywords display
- ✅ Improved error handling and logging
- ✅ Database indexes for faster queries
- ✅ Nginx proxy for API requests

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Contact

For questions or issues, please open an issue on GitHub.
