# YouTube Trends Analytics

A comprehensive analytics platform for uncovering media popularity trends on YouTube.

## 🚀 Features

- **Real-time YouTube Data Analysis**: Track trending videos, channels, and topics
- **Interactive Dashboard**: Beautiful, responsive UI for data visualization
- **Trend Detection**: Identify emerging patterns and viral content
- **Historical Analysis**: Compare trends over time
- **MongoDB Integration**: Scalable data storage and retrieval
- **Hadoop HDFS Integration**: Distributed file system for big data storage
- **Docker Support**: Easy deployment and development setup

## 🏗️ Project Structure

```
youtube-trends-analytics/
├── client/                 # React frontend
├── server/                 # Node.js/Express backend
├── docker/                 # Docker configuration files
├── docs/                   # Project documentation
└── scripts/                # Utility scripts
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Chart.js, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Big Data Storage**: Hadoop HDFS (WebHDFS REST API)
- **Containerization**: Docker & Docker Compose
- **API Integration**: YouTube Data API v3

## 🚀 Quick Start

### Development Mode
```bash
npm run docker:dev
```

### Production Mode
```bash
npm run docker:prod
```

### Local Development (without Docker)
```bash
npm install
npm run dev
```

## 📊 Analytics Features

1. **Video Performance Metrics**
   - View counts, likes, comments analysis
   - Engagement rate calculations
   - Trending duration tracking

2. **Channel Analytics**
   - Subscriber growth patterns
   - Content performance comparison
   - Channel ranking algorithms

3. **Trend Analysis**
   - Keyword trend detection
   - Category popularity shifts
   - Geographic trend variations

## 🔧 Configuration

- MongoDB connection strings in environment variables
- YouTube API key configuration
- Hadoop HDFS configuration (optional)
- Docker environment setup

See `HDFS_INTEGRATION.md` for HDFS setup instructions.

## 📈 Future Enhancements

- Machine learning trend prediction
- Real-time notifications
- Advanced filtering options
- Export functionality
- Social media integration

## 📚 Documentation

- [HDFS Integration Guide](HDFS_INTEGRATION.md) - Complete guide for Hadoop HDFS integration
- [Dataset Suggestions](DATASET_SUGGESTIONS.md) - Recommended datasets for the project
