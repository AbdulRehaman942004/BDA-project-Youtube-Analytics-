# Hadoop HDFS Integration Guide

This document explains how Hadoop HDFS (Hadoop Distributed File System) has been integrated into the YouTube Trending Video Analytics project.

## Overview

HDFS integration allows the project to store large volumes of YouTube trending video data in a distributed file system, which is a core requirement for Big Data Analytics projects. The integration uses WebHDFS REST API to interact with Hadoop clusters.

## Features

✅ **Automatic Data Storage**: Trending videos are automatically stored in HDFS when fetched  
✅ **Analytics Storage**: Analytics data is stored in HDFS for historical analysis  
✅ **File Management**: Upload, download, list, and delete files in HDFS  
✅ **Web Interface**: User-friendly UI for managing HDFS operations  
✅ **Graceful Degradation**: System continues to work even if HDFS is unavailable  

## Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │
│  (Express)  │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐    ┌──────────┐
│ MongoDB  │    │   HDFS   │
│ Database │    │  Storage │
└──────────┘    └──────────┘
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Hadoop HDFS Configuration
HDFS_ENABLED=false              # Set to 'true' to enable HDFS
HDFS_HOST=localhost            # HDFS NameNode host
HDFS_PORT=9870                 # WebHDFS port (default: 9870)
HDFS_USER=hadoop               # HDFS user
HDFS_BASE_PATH=/youtube-trends # Base path in HDFS
```

### Enabling HDFS

1. **Install Hadoop** (if not already installed):
   ```bash
   # For Windows, you can use WSL or Docker
   # For Linux/Mac:
   wget https://archive.apache.org/dist/hadoop/common/hadoop-3.3.4/hadoop-3.3.4.tar.gz
   tar -xzf hadoop-3.3.4.tar.gz
   ```

2. **Configure Hadoop**:
   - Enable WebHDFS in `core-site.xml`:
     ```xml
     <property>
       <name>dfs.webhdfs.enabled</name>
       <value>true</value>
     </property>
     ```

3. **Start Hadoop**:
   ```bash
   start-dfs.sh
   ```

4. **Update .env**:
   ```env
   HDFS_ENABLED=true
   HDFS_HOST=localhost
   HDFS_PORT=9870
   ```

## API Endpoints

### HDFS Status
```http
GET /api/hdfs/status
```
Returns HDFS connection status and configuration.

### List Directory
```http
GET /api/hdfs/list/:path?
```
Lists files and directories in the specified HDFS path.

### Upload Data
```http
POST /api/hdfs/upload
Content-Type: application/json

{
  "data": {...},
  "hdfsPath": "/videos/2024-01-01",
  "filename": "data.json"
}
```

### Download File
```http
GET /api/hdfs/download/:path
```
Downloads a file from HDFS.

### Create Directory
```http
POST /api/hdfs/mkdir
Content-Type: application/json

{
  "path": "/videos/2024-01-01"
}
```

### Delete File/Directory
```http
DELETE /api/hdfs/delete/:path?recursive=true
```

### Statistics
```http
GET /api/hdfs/stats
```
Returns storage statistics (file counts, etc.).

## Automatic Data Storage

When trending videos are fetched via `/api/youtube/trending`, the system automatically:

1. Saves data to MongoDB (existing functionality)
2. Stores data in HDFS (new functionality) at:
   ```
   /youtube-trends/videos/{date}/trending_videos_{date}_{timestamp}.json
   ```

The HDFS storage includes:
- Video metadata
- Statistics (views, likes, comments)
- Trending scores
- Engagement rates
- Timestamps

## Frontend Interface

Access the HDFS management interface at `/hdfs` route:

- **Status Display**: Shows HDFS connection status
- **File Browser**: Navigate and view HDFS directory structure
- **Upload**: Upload JSON data to HDFS
- **Download**: Download files from HDFS
- **Delete**: Remove files/directories
- **Statistics**: View storage statistics

## Data Structure in HDFS

```
/youtube-trends/
├── videos/
│   ├── 2024-01-01/
│   │   ├── trending_videos_2024-01-01_1704067200000.json
│   │   └── trending_videos_2024-01-01_1704153600000.json
│   └── 2024-01-02/
│       └── ...
└── analytics/
    ├── 2024-01-01/
    │   └── analytics_2024-01-01_1704067200000.json
    └── ...
```

## Testing Without Hadoop

The system is designed to work gracefully without Hadoop:

- Set `HDFS_ENABLED=false` in `.env`
- The system will continue to function normally
- MongoDB storage will work as before
- HDFS operations will be skipped with warnings

## Development Setup

1. **Without Hadoop** (for development):
   ```env
   HDFS_ENABLED=false
   ```
   The project works normally, just without HDFS storage.

2. **With Hadoop** (for full functionality):
   - Install and configure Hadoop
   - Enable WebHDFS
   - Set `HDFS_ENABLED=true`
   - Start Hadoop services

## Docker Setup (Optional)

You can use Docker to run Hadoop:

```yaml
# docker-compose.hadoop.yml
version: '3.8'
services:
  hadoop:
    image: bde2020/hadoop-namenode:2.0.0-hadoop3.2.1-java8
    ports:
      - "9870:9870"
    environment:
      - CLUSTER_NAME=test
```

## Troubleshooting

### HDFS Connection Refused
- Ensure Hadoop is running
- Check WebHDFS is enabled
- Verify port 9870 is accessible
- Check firewall settings

### Permission Denied
- Ensure the HDFS user has write permissions
- Check HDFS user configuration in `.env`

### Files Not Appearing
- Check HDFS logs
- Verify directory creation succeeded
- Check file permissions

## Benefits for Big Data Analytics

1. **Scalability**: HDFS can handle petabytes of data
2. **Fault Tolerance**: Data replication across nodes
3. **Cost-Effective**: Store large datasets efficiently
4. **Integration**: Works with Hadoop ecosystem (MapReduce, Spark, etc.)
5. **Historical Analysis**: Long-term data storage for trend analysis

## Next Steps

1. **Data Processing**: Use MapReduce or Spark to process HDFS data
2. **Analytics**: Run batch analytics jobs on stored data
3. **Visualization**: Create dashboards from HDFS data
4. **Machine Learning**: Train models on historical HDFS data

## References

- [Hadoop Documentation](https://hadoop.apache.org/docs/current/)
- [WebHDFS REST API](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/WebHDFS.html)
- [HDFS User Guide](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html)

