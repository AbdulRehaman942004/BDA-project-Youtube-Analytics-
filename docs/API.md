# YouTube Trends Analytics API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required for the API endpoints.

## Endpoints

### Health Check
**GET** `/health`

Returns the health status of the API and database connection.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": {
    "status": "connected",
    "connectionState": 1
  },
  "memory": {
    "used": "45 MB",
    "total": "128 MB"
  },
  "version": "1.0.0"
}
```

### YouTube Data

#### Get Trending Videos
**GET** `/youtube/trending`

Fetches trending videos from YouTube API and stores them in the database.

**Query Parameters:**
- `regionCode` (string, optional): Country code (default: "US")
- `maxResults` (number, optional): Number of results (default: 50)
- `categoryId` (string, optional): YouTube category ID

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "videoId": "dQw4w9WgXcQ",
      "title": "Never Gonna Give You Up",
      "description": "The official video for Rick Astley - Never Gonna Give You Up",
      "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
      "channelTitle": "Rick Astley",
      "publishedAt": "2009-10-25T06:57:33Z",
      "thumbnails": {
        "default": "https://...",
        "medium": "https://...",
        "high": "https://..."
      },
      "statistics": {
        "viewCount": 1000000000,
        "likeCount": 10000000,
        "commentCount": 500000
      },
      "trendingScore": 1250000,
      "engagementRate": 1.05
    }
  ]
}
```

#### Search Videos
**GET** `/youtube/search`

Search for videos on YouTube.

**Query Parameters:**
- `q` (string, required): Search query
- `maxResults` (number, optional): Number of results (default: 25)
- `order` (string, optional): Sort order (relevance, date, rating, viewCount)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "videoId": "dQw4w9WgXcQ",
      "title": "Never Gonna Give You Up",
      "description": "The official video...",
      "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
      "channelTitle": "Rick Astley",
      "publishedAt": "2009-10-25T06:57:33Z",
      "thumbnails": {
        "medium": "https://...",
        "high": "https://..."
      },
      "categoryId": "10"
    }
  ]
}
```

#### Get Video Details
**GET** `/youtube/video/:videoId`

Get detailed information about a specific video.

**Path Parameters:**
- `videoId` (string): YouTube video ID

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up",
    "description": "The official video...",
    "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
    "channelTitle": "Rick Astley",
    "publishedAt": "2009-10-25T06:57:33Z",
    "statistics": {
      "viewCount": 1000000000,
      "likeCount": 10000000,
      "commentCount": 500000
    },
    "trendingScore": 1250000,
    "engagementRate": 1.05
  }
}
```

### Analytics

#### Get Dashboard Data
**GET** `/analytics/dashboard`

Get aggregated analytics data for the dashboard.

**Query Parameters:**
- `timeRange` (string, optional): Time range (1d, 7d, 30d, 90d, default: 7d)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalVideos": 1250,
      "totalViews": 50000000,
      "timeRange": "7d"
    },
    "topVideos": [...],
    "topChannels": [...],
    "categoryStats": [...],
    "engagementStats": {
      "avgEngagement": 2.5,
      "maxEngagement": 15.2,
      "minEngagement": 0.1
    },
    "trendingKeywords": [...]
  }
}
```

#### Get Trends
**GET** `/analytics/trends`

Get trend analysis data.

**Query Parameters:**
- `category` (string, optional): Filter by category
- `limit` (number, optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "keyword": "AI",
      "category": "Technology",
      "trendScore": 95.5,
      "peakScore": 98.2,
      "duration": 72,
      "startDate": "2023-11-01T00:00:00Z",
      "peakDate": "2023-11-03T12:00:00Z",
      "status": "active",
      "relatedVideos": [...],
      "relatedChannels": [...]
    }
  ]
}
```

#### Get Channel Analytics
**GET** `/analytics/channels/:channelId`

Get analytics data for a specific channel.

**Path Parameters:**
- `channelId` (string): YouTube channel ID

**Query Parameters:**
- `timeRange` (string, optional): Time range (7d, 30d, 90d, default: 30d)

**Response:**
```json
{
  "success": true,
  "data": {
    "channel": {
      "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
      "title": "Rick Astley",
      "description": "Official Rick Astley channel",
      "statistics": {
        "viewCount": 2000000000,
        "subscriberCount": 1000000,
        "videoCount": 150
      }
    },
    "videos": [...],
    "analytics": {
      "totalViews": 50000000,
      "totalLikes": 2500000,
      "totalComments": 125000,
      "avgEngagement": 5.25,
      "videoCount": 25
    }
  }
}
```

#### Get Video Performance
**GET** `/analytics/performance/:videoId`

Get performance analytics for a specific video.

**Path Parameters:**
- `videoId` (string): YouTube video ID

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up",
    "currentStats": {
      "viewCount": 1000000000,
      "likeCount": 10000000,
      "commentCount": 500000
    },
    "engagementRate": 1.05,
    "trendingScore": 1250000,
    "publishedAt": "2009-10-25T06:57:33Z"
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "stack": "Error stack trace (development only)"
  }
}
```

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Returns HTTP 429 when limit is exceeded

## Status Codes

- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
