# YouTube Trends Analytics - Complete Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [Backend Architecture](#backend-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [API Endpoints](#api-endpoints)
9. [Caching System](#caching-system)
10. [Performance Optimizations](#performance-optimizations)
11. [Docker Architecture](#docker-architecture)
12. [Security Features](#security-features)
13. [Error Handling](#error-handling)
14. [Deployment Flow](#deployment-flow)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                    (http://localhost:3000)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP Requests (/api/*)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Nginx (Frontend)                          │
│  - Serves React static files                                │
│  - Proxies /api requests to backend                        │
│  - Port: 80 (mapped to 3000)                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Proxy /api → backend:5000
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Express.js Backend (Node.js)                    │
│  - REST API endpoints                                       │
│  - Business logic                                          │
│  - Data aggregation                                        │
│  - Caching layer                                           │
│  - Port: 5000                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ MongoDB Queries
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    MongoDB 7.0                              │
│  - Video data                                              │
│  - Channel data                                            │
│  - Trend data                                              │
│  - Port: 27017                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User Request** → Browser makes HTTP request
2. **Nginx** → Receives request, serves static files or proxies API calls
3. **Backend** → Processes request, checks cache, queries database
4. **MongoDB** → Returns data
5. **Backend** → Processes data, caches result, returns JSON
6. **Nginx** → Forwards response to browser
7. **Frontend** → Updates UI with data

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| TypeScript | 5.3.3 | Type safety |
| Material-UI (MUI) | 5.15.0 | UI components |
| Recharts | Latest | Data visualization |
| Axios | 1.6.2 | HTTP client |
| React Router | 6.20.1 | Client-side routing |
| Nginx | Alpine | Web server & reverse proxy |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.18.2 | Web framework |
| TypeScript | 5.3.3 | Type safety |
| Mongoose | 8.0.3 | MongoDB ODM |
| dotenv | 16.3.1 | Environment variables |
| cors | 2.8.5 | CORS handling |
| helmet | 7.1.0 | Security headers |
| compression | 1.7.4 | Response compression |
| express-rate-limit | 7.1.5 | Rate limiting |
| morgan | 1.10.0 | HTTP logging |

### Database Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 7.0 | NoSQL database |
| Mongoose | 8.0.3 | Schema modeling |

### DevOps Stack

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |
| Nginx | Reverse proxy & static file serving |

---

## System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  - React Frontend (Client-side rendering)                   │
│  - Material-UI Components                                    │
│  - Charts and Visualizations                                 │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  - Express.js REST API                                       │
│  - Business Logic                                           │
│  - Data Aggregation                                         │
│  - Caching Layer                                            │
└─────────────────────────────────────────────────────────────┘
                            ↕ MongoDB Driver
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  - MongoDB Database                                          │
│  - Indexed Collections                                      │
│  - Aggregation Pipelines                                    │
└─────────────────────────────────────────────────────────────┘
```

### Request-Response Cycle

1. **Client Request**
   - User interacts with React UI
   - Axios makes HTTP request to `/api/*`
   - Request goes through Nginx proxy

2. **Backend Processing**
   - Express middleware chain processes request
   - Route handler executes business logic
   - Cache checked first (if applicable)
   - MongoDB query executed (if cache miss)

3. **Data Processing**
   - Raw data retrieved from MongoDB
   - Data transformed/aggregated
   - Category IDs mapped to names
   - Response formatted as JSON

4. **Response**
   - JSON response sent to client
   - Data cached (if applicable)
   - Frontend updates UI

---

## Data Flow

### Complete Data Flow Diagram

```
┌──────────────┐
│   Kaggle     │
│   Dataset    │
│  (CSV Files) │
└──────┬───────┘
       │
       │ importDataset.js
       │ - Parses CSV
       │ - Calculates scores
       │ - Transforms data
       │
┌──────▼──────────────────────────────────────┐
│           MongoDB Database                   │
│  ┌──────────────────────────────────────┐   │
│  │  videos collection                    │   │
│  │  - videoId, title, description        │   │
│  │  - statistics (views, likes, etc.)   │   │
│  │  - trendingScore, engagementRate      │   │
│  │  - categoryId, countryCode            │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  channels collection                  │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  trends collection                    │   │
│  └──────────────────────────────────────┘   │
└──────┬──────────────────────────────────────┘
       │
       │ Mongoose Query
       │
┌──────▼──────────────────────────────────────┐
│      Express.js Backend                     │
│  ┌──────────────────────────────────────┐   │
│  │  Route Handler                        │   │
│  │  - /api/analytics/dashboard          │   │
│  └──────┬───────────────────────────────┘   │
│         │                                    │
│  ┌──────▼───────────────────────────────┐   │
│  │  Cache Check                         │   │
│  │  - Check in-memory cache             │   │
│  │  - Return if found                   │   │
│  └──────┬───────────────────────────────┘   │
│         │                                    │
│  ┌──────▼───────────────────────────────┐   │
│  │  MongoDB Aggregation                 │   │
│  │  - $facet for parallel queries       │   │
│  │  - $group, $sort, $limit             │   │
│  └──────┬───────────────────────────────┘   │
│         │                                    │
│  ┌──────▼───────────────────────────────┐   │
│  │  Data Processing                     │   │
│  │  - Category ID → Name mapping        │   │
│  │  - Data enrichment                   │   │
│  │  - Formatting                        │   │
│  └──────┬───────────────────────────────┘   │
│         │                                    │
│  ┌──────▼───────────────────────────────┐   │
│  │  Cache Storage                       │   │
│  │  - Store in memory                   │   │
│  │  - Set TTL (2-15 min)                │   │
│  └──────┬───────────────────────────────┘   │
│         │                                    │
│  ┌──────▼───────────────────────────────┐   │
│  │  JSON Response                       │   │
│  │  { success: true, data: {...} }      │   │
│  └──────────────────────────────────────┘   │
└──────┬──────────────────────────────────────┘
       │
       │ HTTP Response (JSON)
       │
┌──────▼──────────────────────────────────────┐
│      Nginx Proxy                            │
│  - Receives response                        │
│  - Forwards to client                       │
└──────┬──────────────────────────────────────┘
       │
       │ HTTP Response
       │
┌──────▼──────────────────────────────────────┐
│      React Frontend                         │
│  ┌──────────────────────────────────────┐   │
│  │  Axios Interceptor                   │   │
│  │  - Check localStorage cache          │   │
│  │  - Make HTTP request                 │   │
│  └──────┬───────────────────────────────┘   │
│         │                                    │
│  ┌──────▼───────────────────────────────┐   │
│  │  Response Processing                 │   │
│  │  - Parse JSON                        │   │
│  │  - Update state                      │   │
│  │  - Cache in localStorage             │   │
│  └──────┬───────────────────────────────┘   │
│         │                                    │
│  ┌──────▼───────────────────────────────┐   │
│  │  UI Update                           │   │
│  │  - Render components                 │   │
│  │  - Display charts                    │   │
│  │  - Show data                         │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Detailed Request Flow Example: Dashboard Load

1. **User Action**: User navigates to Dashboard page
2. **React Component**: `Dashboard.tsx` mounts, calls `fetchDashboardData()`
3. **API Call**: `api.get('/analytics/dashboard?timeRange=7d')`
4. **Frontend Cache Check**: Checks localStorage for cached data
5. **Nginx Proxy**: Receives request, proxies to `http://backend:5000/api/analytics/dashboard`
6. **Backend Route**: `analytics.ts` route handler executes
7. **Backend Cache Check**: Checks in-memory cache for `dashboard:7d`
8. **MongoDB Query**: If cache miss, executes aggregation pipeline:
   ```javascript
   Video.aggregate([
     { $match: { publishedAt: { $gte: startDate } } },
     { $facet: {
       totalVideos: [{ $count: 'count' }],
       totalViews: [{ $group: { _id: null, total: { $sum: '$statistics.viewCount' } } }],
       topVideos: [{ $sort: { trendingScore: -1 } }, { $limit: 15 }],
       categoryStats: [{ $group: { _id: '$categoryId', count: { $sum: 1 } } }],
       engagementStats: [{ $group: { _id: null, avgEngagement: { $avg: '$engagementRate' } } }]
     }}
   ])
   ```
9. **Data Processing**: 
   - Category IDs mapped to names using `categoryMapper.ts`
   - Trending keywords extracted from tags
   - Data formatted
10. **Cache Storage**: Result stored in memory cache (TTL: 5 minutes)
11. **JSON Response**: `{ success: true, data: { overview, topVideos, categoryStats, ... } }`
12. **Frontend Processing**: 
    - Response received
    - Data stored in component state
    - Cached in localStorage
13. **UI Render**: React components render with data, charts display

---

## Database Schema

### Video Collection Schema

```typescript
{
  videoId: String (unique, indexed),
  title: String (required),
  description: String,
  channelId: String (indexed),
  channelTitle: String (required),
  publishedAt: Date (indexed),
  thumbnails: {
    default: String,
    medium: String,
    high: String
  },
  statistics: {
    viewCount: Number (default: 0),
    likeCount: Number (default: 0),
    commentCount: Number (default: 0)
  },
  categoryId: String (indexed),
  tags: [String],
  duration: String,
  trendingScore: Number (indexed, default: 0),
  engagementRate: Number (indexed, default: 0),
  countryCode: String (indexed),
  trendingDate: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes on Video Collection

```javascript
// Performance indexes
{ videoId: 1 }                                    // Unique index
{ trendingScore: -1, publishedAt: -1 }           // For trending queries
{ channelId: 1, publishedAt: -1 }                // For channel queries
{ categoryId: 1, trendingScore: -1 }             // For category queries
{ publishedAt: -1 }                              // For date range queries
{ publishedAt: 1, trendingScore: -1 }             // For date + sort
{ channelId: 1, publishedAt: -1, trendingScore: -1 } // Channel aggregations
{ categoryId: 1, publishedAt: -1 }               // Category aggregations
{ engagementRate: -1 }                           // Engagement stats
{ countryCode: 1, publishedAt: -1 }              // Country-based queries
```

### Channel Collection Schema

```typescript
{
  channelId: String (unique, indexed),
  title: String,
  description: String,
  statistics: {
    viewCount: Number,
    subscriberCount: Number,
    videoCount: Number
  },
  trendingVideosCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Trend Collection Schema

```typescript
{
  keyword: String (indexed),
  category: String,
  trendScore: Number (indexed),
  status: String (enum: ['active', 'inactive']),
  startDate: Date,
  relatedVideos: [ObjectId], // References to Video
  relatedChannels: [ObjectId], // References to Channel
  createdAt: Date,
  updatedAt: Date
}
```

---

## Backend Architecture

### Directory Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── middleware/
│   │   ├── errorHandler.ts      # Global error handler
│   │   └── notFound.ts          # 404 handler
│   ├── models/
│   │   ├── Video.ts             # Video schema
│   │   ├── Channel.ts           # Channel schema
│   │   └── Trend.ts             # Trend schema
│   ├── routes/
│   │   ├── analytics.ts         # Dashboard & analytics endpoints
│   │   ├── youtube.ts           # Trending & search endpoints
│   │   ├── dataset.ts           # Dataset statistics
│   │   ├── advancedAnalytics.ts # Advanced analytics
│   │   └── health.ts            # Health check
│   ├── services/
│   │   ├── statisticalAnalysis.ts # Statistical calculations
│   │   └── dataExporter.ts      # Data export utilities
│   ├── utils/
│   │   ├── cache.ts             # In-memory cache
│   │   └── categoryMapper.ts    # Category ID → Name mapping
│   └── index.ts                 # Application entry point
├── Dockerfile
└── package.json
```

### Request Processing Pipeline

```
HTTP Request
    │
    ├─→ Helmet (Security headers)
    │
    ├─→ CORS (Cross-origin handling)
    │
    ├─→ Rate Limiter (100 req/15min per IP)
    │
    ├─→ Compression (Gzip)
    │
    ├─→ Morgan (Logging)
    │
    ├─→ Body Parser (JSON, URL-encoded)
    │
    ├─→ Route Handler
    │   │
    │   ├─→ Cache Check
    │   │   ├─→ Cache Hit → Return cached data
    │   │   └─→ Cache Miss → Continue
    │   │
    │   ├─→ MongoDB Query
    │   │   ├─→ Aggregation Pipeline
    │   │   ├─→ Data Processing
    │   │   └─→ Cache Storage
    │   │
    │   └─→ JSON Response
    │
    └─→ Error Handler (if error)
```

### Key Backend Components

#### 1. Express Application (`index.ts`)

```typescript
// Middleware Stack
app.use(helmet())           // Security headers
app.use(cors())             // CORS configuration
app.use(rateLimit())        // Rate limiting
app.use(compression())      // Response compression
app.use(morgan())           // Request logging
app.use(express.json())     // JSON body parser

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/youtube', youtubeRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/dataset', datasetRoutes)

// Error Handling
app.use(notFound)           // 404 handler
app.use(errorHandler)       // Global error handler
```

#### 2. Database Connection (`config/database.ts`)

```typescript
// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  authSource: 'admin'
})
```

#### 3. Route Handlers

Each route file exports an Express Router with endpoints:
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/youtube/trending` - Trending videos
- `GET /api/youtube/search` - Search videos
- `GET /api/dataset/stats` - Dataset statistics

#### 4. Caching System (`utils/cache.ts`)

```typescript
class SimpleCache {
  private cache: Map<string, CacheEntry>
  
  get<T>(key: string): T | null
  set<T>(key: string, data: T, ttl: number): void
  delete(key: string): void
  clear(): void
  cleanup(): void  // Removes expired entries
}
```

**Cache Strategy:**
- TTL based on timeRange:
  - 1 day: 2 minutes
  - 7 days: 5 minutes
  - 30 days: 10 minutes
  - 90 days: 15 minutes
- Automatic cleanup every 10 minutes

#### 5. Category Mapper (`utils/categoryMapper.ts`)

```typescript
// Loads categories.json
// Maps category ID (e.g., "22") → Name (e.g., "People & Blogs")

getCategoryName(categoryId: string): string
getAllCategories(): Array<{id: string, name: string}>
enrichCategoryStats(stats: Array<{_id: string, count: number}>)
```

---

## Frontend Architecture

### Directory Structure

```
client/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Navbar.tsx           # Navigation component
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Analytics.tsx        # Advanced analytics
│   │   ├── TrendingVideos.tsx   # Trending videos page
│   │   ├── Search.tsx           # Search page
│   │   └── Dataset.tsx          # Dataset browser
│   ├── services/
│   │   └── api.ts               # Axios client with caching
│   ├── utils/
│   │   ├── cache.ts             # localStorage cache
│   │   └── categoryMapper.ts    # Category name mapping
│   ├── types/
│   │   └── axios.d.ts           # TypeScript declarations
│   ├── App.tsx                  # Main app component
│   └── index.tsx                # Entry point
├── Dockerfile
├── nginx.conf
└── package.json
```

### Component Hierarchy

```
App.tsx
├── Router
│   ├── Navbar (always visible)
│   │
│   ├── Route: / → Dashboard
│   │   └── Dashboard.tsx
│   │       ├── Overview Cards (Views, Videos, Engagement)
│   │       ├── Category Distribution Chart
│   │       ├── Trending Keywords
│   │       └── Top Trending Videos
│   │
│   ├── Route: /analytics → Analytics
│   │   └── Analytics.tsx
│   │       ├── Tabs (Overview, Categories, Trends)
│   │       ├── Charts (Pie, Bar, Line)
│   │       └── Statistics
│   │
│   ├── Route: /trending → TrendingVideos
│   │   └── TrendingVideos.tsx
│   │       └── Video Grid
│   │
│   ├── Route: /search → Search
│   │   └── Search.tsx
│   │       └── Search Form + Results
│   │
│   └── Route: /dataset → Dataset
│       └── Dataset.tsx
│           └── Video Table with Filters
```

### State Management

**Component-Level State:**
- Each page component manages its own state
- Uses React `useState` and `useEffect` hooks
- No global state management library (Redux, etc.)

**Data Flow:**
```
Component Mount
    │
    ├─→ useEffect(() => fetchData())
    │
    ├─→ api.get('/api/endpoint')
    │   │
    │   ├─→ Check localStorage cache
    │   │   ├─→ Cache Hit → Use cached data
    │   │   └─→ Cache Miss → Make HTTP request
    │   │
    │   └─→ Update component state
    │
    └─→ Render UI with data
```

### API Client (`services/api.ts`)

**Features:**
- Axios instance with base URL configuration
- Request/response interceptors
- Automatic caching
- Error handling

**Request Interceptor:**
```typescript
// Checks localStorage cache before making request
if (cached) {
  return cached response
}
```

**Response Interceptor:**
```typescript
// Caches successful GET responses
// TTL matches backend cache TTL
frontendCache.set(cacheKey, response.data, ttl)
```

### Frontend Caching (`utils/cache.ts`)

**Implementation:**
- Uses `localStorage` for persistence
- TTL-based expiration
- Automatic cleanup of expired entries
- Handles quota exceeded errors

**Cache Key Format:**
```
get_/api/analytics/dashboard_{"timeRange":"7d"}
```

---

## API Endpoints

### Analytics Endpoints

#### GET `/api/analytics/dashboard`
**Purpose:** Get dashboard overview data

**Query Parameters:**
- `timeRange` (optional): `1d`, `7d`, `30d`, `90d` (default: `7d`)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalVideos": 184287,
      "totalViews": 1234567890,
      "timeRange": "7d"
    },
    "topVideos": [...],
    "categoryStats": [
      { "id": "22", "name": "People & Blogs", "count": 12345 }
    ],
    "engagementStats": {
      "avgEngagement": 4.32,
      "maxEngagement": 15.5,
      "minEngagement": 0.1
    },
    "trendingKeywords": [
      { "keyword": "comedy", "trendScore": 1234 }
    ]
  },
  "cached": false
}
```

**Processing:**
1. Check cache for `dashboard:${timeRange}`
2. If cache miss, execute MongoDB aggregation
3. Process data (category mapping, keyword filtering)
4. Cache result
5. Return JSON response

### YouTube Endpoints

#### GET `/api/youtube/trending`
**Purpose:** Get trending videos

**Query Parameters:**
- `regionCode` (optional): Country code (e.g., `US`, `GB`)
- `maxResults` (optional): Number of results (default: 50)
- `categoryId` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "videoId": "abc123",
      "title": "Video Title",
      "channelTitle": "Channel Name",
      "statistics": {
        "viewCount": 1000000,
        "likeCount": 50000,
        "commentCount": 5000
      },
      "trendingScore": 12345,
      "engagementRate": 5.5
    }
  ]
}
```

#### GET `/api/youtube/search`
**Purpose:** Search videos

**Query Parameters:**
- `q` (required): Search query
- `maxResults` (optional): Number of results (default: 25)
- `order` (optional): `relevance`, `date`, `rating`, `viewCount`

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [...]
}
```

### Dataset Endpoints

#### GET `/api/dataset/stats`
**Purpose:** Get dataset statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVideos": 184287,
    "totalChannels": 12345,
    "countries": [...],
    "categories": [...]
  }
}
```

#### GET `/api/dataset/videos`
**Purpose:** Get paginated video list

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `categoryId` (optional): Filter by category
- `countryCode` (optional): Filter by country
- `sortBy` (optional): Sort field (default: `trendingScore`)

### Health Endpoint

#### GET `/api/health`
**Purpose:** Health check

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

---

## Caching System

### Two-Level Caching Architecture

```
┌─────────────────────────────────────────┐
│         Frontend Cache                  │
│  (localStorage)                         │
│  - TTL: 2-15 minutes                    │
│  - Instant display                      │
│  - Background refresh                   │
└──────────────┬──────────────────────────┘
               │
               │ HTTP Request (if cache miss)
               │
┌──────────────▼──────────────────────────┐
│         Backend Cache                   │
│  (In-memory)                            │
│  - TTL: 2-15 minutes                    │
│  - Reduces DB queries                   │
│  - Faster response                      │
└──────────────┬──────────────────────────┘
               │
               │ MongoDB Query (if cache miss)
               │
┌──────────────▼──────────────────────────┐
│         MongoDB Database                │
│  - Source of truth                      │
│  - Indexed queries                      │
└─────────────────────────────────────────┘
```

### Cache Flow

1. **Frontend Request:**
   - Check localStorage cache
   - If found and not expired → Display immediately
   - Make HTTP request in background

2. **Backend Request:**
   - Check in-memory cache
   - If found and not expired → Return cached data
   - If cache miss → Query MongoDB

3. **Cache Storage:**
   - Backend stores in memory
   - Frontend stores in localStorage
   - Both use same TTL

### Cache Invalidation

- **Time-based:** Automatic expiration after TTL
- **Manual:** Cache cleared on server restart
- **Background Refresh:** Frontend updates cache in background

### Performance Impact

| Scenario | Without Cache | With Cache | Improvement |
|----------|---------------|------------|-------------|
| First Load | 25-30s | 25-30s | - |
| Cached Load | 25-30s | <0.5s | **98% faster** |
| Subsequent Loads | 25-30s | <0.5s | **98% faster** |

---

## Performance Optimizations

### Database Optimizations

1. **Indexes:**
   - Composite indexes for common query patterns
   - Indexes on frequently filtered/sorted fields
   - Reduces query time from seconds to milliseconds

2. **Aggregation Optimization:**
   - `$facet` for parallel aggregations
   - `allowDiskUse: true` for large operations
   - Early `$limit` to reduce memory usage
   - Projection to fetch only needed fields

3. **Query Optimization:**
   - Use `lean()` for read-only queries
   - Limit results early in pipeline
   - Use `$match` before `$unwind` to reduce data

### Application Optimizations

1. **Caching:**
   - In-memory cache reduces DB queries
   - Frontend cache provides instant display
   - TTL-based expiration balances freshness and performance

2. **Response Compression:**
   - Gzip compression reduces payload size
   - Faster network transfer

3. **Connection Pooling:**
   - MongoDB connection pool (max 10 connections)
   - Reuses connections efficiently

### Frontend Optimizations

1. **Code Splitting:**
   - React lazy loading for routes
   - Reduces initial bundle size

2. **Asset Caching:**
   - Nginx caches static assets for 1 year
   - Reduces server load

3. **Request Batching:**
   - Single endpoint for dashboard data
   - Reduces number of HTTP requests

---

## Docker Architecture

### Container Structure

```
┌─────────────────────────────────────────────────────────┐
│              Docker Network: youtube-trends-network     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Frontend Container (nginx:alpine)               │  │
│  │  - Port: 80 (mapped to 3000)                     │  │
│  │  - Serves React build files                     │  │
│  │  - Proxies /api to backend                      │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                │
│                        │ /api → backend:5000           │
│                        │                                │
│  ┌────────────────────▼──────────────────────────────┐  │
│  │  Backend Container (node:18-alpine)               │  │
│  │  - Port: 5000                                     │  │
│  │  - Express.js server                              │  │
│  │  - Volume: ./data:/app/data:ro                    │  │
│  └────────────────────┬──────────────────────────────┘  │
│                       │                                  │
│                       │ MongoDB queries                 │
│                       │                                  │
│  ┌────────────────────▼──────────────────────────────┐  │
│  │  MongoDB Container (mongo:7.0)                    │  │
│  │  - Port: 27017                                    │  │
│  │  - Volume: mongodb_data:/data/db                 │  │
│  │  - Auth: admin/password123                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Container Communication

- **Frontend → Backend:** Via Docker network using service name `backend`
- **Backend → MongoDB:** Via Docker network using service name `mongodb`
- **External Access:** Ports mapped to host (3000, 5000, 27017)

### Volume Mounts

- **MongoDB Data:** `mongodb_data` volume (persistent)
- **Categories JSON:** `./data:/app/data:ro` (read-only)

### Health Checks

All containers have health checks:
- **MongoDB:** `mongosh --eval "db.adminCommand('ping')"`
- **Backend:** `curl -f http://localhost:5000/api/health`
- **Frontend:** `wget --spider http://localhost/`

---

## Security Features

### Backend Security

1. **Helmet.js:**
   - Sets security HTTP headers
   - Prevents XSS attacks
   - Hides server information

2. **CORS:**
   - Configured for allowed origins
   - Prevents unauthorized access

3. **Rate Limiting:**
   - 100 requests per 15 minutes per IP
   - Prevents abuse

4. **Input Validation:**
   - Query parameter validation
   - Prevents injection attacks

5. **MongoDB Authentication:**
   - Username/password authentication
   - `authSource: admin` configuration

### Frontend Security

1. **Nginx Security Headers:**
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`

2. **Content Security:**
   - Static file serving
   - No server-side code execution

### Docker Security

1. **Network Isolation:**
   - Containers communicate via internal network
   - No direct external access to backend/MongoDB

2. **Read-Only Mounts:**
   - Data directory mounted as read-only
   - Prevents accidental modifications

---

## Error Handling

### Backend Error Handling

**Middleware Chain:**
```typescript
try {
  // Route handler logic
} catch (error) {
  // Error caught by errorHandler middleware
  res.status(500).json({
    success: false,
    error: error.message
  })
}
```

**Error Types:**
- **400 Bad Request:** Invalid query parameters
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server errors
- **503 Service Unavailable:** Database connection issues

### Frontend Error Handling

**API Error Handling:**
```typescript
try {
  const response = await api.get('/api/endpoint')
  // Handle success
} catch (error) {
  // Display error message to user
  setError(error.response?.data?.error || 'Request failed')
}
```

**User-Friendly Messages:**
- Network errors: "Failed to connect to server"
- Timeout errors: "Request timed out"
- Server errors: Display server error message

---

## Deployment Flow

### Docker Deployment

1. **Build Phase:**
   ```bash
   docker-compose build
   ```
   - Builds frontend React app
   - Compiles backend TypeScript
   - Creates Docker images

2. **Start Phase:**
   ```bash
   docker-compose up -d
   ```
   - Starts MongoDB container
   - Waits for MongoDB health check
   - Starts backend container
   - Waits for backend health check
   - Starts frontend container

3. **Health Checks:**
   - All containers must pass health checks
   - Dependencies wait for upstream services

### Data Import Flow

1. **Dataset Download:**
   - CSV files from Kaggle
   - Stored in `data/kaggle/`

2. **Data Import:**
   ```bash
   node data/importDataset.js
   ```
   - Parses CSV files
   - Calculates trending scores
   - Calculates engagement rates
   - Imports to MongoDB
   - Creates indexes

3. **Verification:**
   - Check import statistics
   - Verify data in MongoDB

---

## Complete Request-Response Example

### User Opens Dashboard

1. **Browser:** User navigates to `http://localhost:3000`
2. **Nginx:** Serves `index.html` and React bundle
3. **React:** App loads, `Dashboard.tsx` component mounts
4. **Dashboard Component:**
   ```typescript
   useEffect(() => {
     fetchDashboardData()
   }, [])
   ```
5. **API Call:**
   ```typescript
   api.get('/api/analytics/dashboard?timeRange=7d')
   ```
6. **Frontend Cache Check:**
   - Checks localStorage for `get_/api/analytics/dashboard_{"timeRange":"7d"}`
   - If found and not expired → Use cached data
7. **Nginx Proxy:**
   - Receives `/api/analytics/dashboard?timeRange=7d`
   - Proxies to `http://backend:5000/api/analytics/dashboard?timeRange=7d`
8. **Backend Route:**
   - `analytics.ts` route handler executes
   - Extracts `timeRange` from query (default: `7d`)
9. **Backend Cache Check:**
   - Checks in-memory cache for `dashboard:7d`
   - If found and not expired → Return cached data
10. **MongoDB Query (if cache miss):**
    ```javascript
    Video.aggregate([
      { $match: { publishedAt: { $gte: startDate } } },
      { $facet: {
        totalVideos: [{ $count: 'count' }],
        totalViews: [{ $group: { _id: null, total: { $sum: '$statistics.viewCount' } } }],
        topVideos: [
          { $sort: { trendingScore: -1 } },
          { $limit: 15 }
        ],
        categoryStats: [
          { $group: { _id: '$categoryId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        engagementStats: [
          { $group: {
            _id: null,
            avgEngagement: { $avg: '$engagementRate' },
            maxEngagement: { $max: '$engagementRate' },
            minEngagement: { $min: '$engagementRate' }
          }}
        ],
        trendingKeywords: [
          { $unwind: '$tags' },
          { $match: { tags: { $exists: true, $nin: [null, '', '[none]'] } } },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 25 }
        ]
      }}
    ], { allowDiskUse: true })
    ```
11. **Data Processing:**
    - Category IDs mapped to names using `categoryMapper.ts`
    - Trending keywords filtered (removes `[none]`, empty strings)
    - Data formatted for response
12. **Cache Storage:**
    - Result stored in memory cache with TTL (5 minutes for 7d)
13. **JSON Response:**
    ```json
    {
      "success": true,
      "data": {
        "overview": { "totalVideos": 184287, "totalViews": 1234567890 },
        "topVideos": [...],
        "categoryStats": [...],
        "engagementStats": {...},
        "trendingKeywords": [...]
      },
      "cached": false
    }
    ```
14. **Frontend Processing:**
    - Response received
    - Data stored in component state: `setData(response.data.data)`
    - Cached in localStorage with matching TTL
15. **UI Render:**
    - React components render with data
    - Charts display using Recharts
    - Cards show statistics
    - Loading state cleared

---

## Key Algorithms & Calculations

### Trending Score Calculation

```javascript
trendingScore = (views * 0.1) + (likes * 2) + (comments * 5)
```

**Rationale:**
- Views weighted less (0.1) - many views but low engagement
- Likes weighted more (2) - indicates positive engagement
- Comments weighted most (5) - highest engagement indicator

### Engagement Rate Calculation

```javascript
engagementRate = ((likes + comments) / views) * 100
```

**Example:**
- Views: 10,000
- Likes: 300
- Comments: 132
- Engagement Rate: ((300 + 132) / 10000) * 100 = 4.32%

**Interpretation:**
- 4.32% of viewers engaged with the video
- Industry average: 2-5% is considered good

### Category Name Mapping

```javascript
// categories.json structure
{
  "items": [
    { "id": "22", "snippet": { "title": "People & Blogs" } },
    { "id": "25", "snippet": { "title": "News & Politics" } }
  ]
}

// Mapping function
getCategoryName("22") → "People & Blogs"
```

---

## File Processing Flow

### Dataset Import Process

1. **CSV Parsing:**
   ```javascript
   csvParser()
     .on('data', (row) => {
       // Process each video row
     })
   ```

2. **Data Transformation:**
   - Parse dates
   - Convert strings to numbers
   - Calculate trending scores
   - Calculate engagement rates
   - Extract tags

3. **MongoDB Insert:**
   ```javascript
   Video.insertMany(videos, { ordered: false })
   ```

4. **Index Creation:**
   - Indexes created automatically via Mongoose schema
   - Ensures fast queries

---

## Summary

This YouTube Trends Analytics platform is a full-stack application with:

- **Frontend:** React + TypeScript + Material-UI
- **Backend:** Node.js + Express.js + TypeScript
- **Database:** MongoDB with Mongoose
- **Architecture:** RESTful API, three-tier architecture
- **Performance:** Multi-level caching, database indexes
- **Deployment:** Fully containerized with Docker
- **Security:** Helmet, CORS, rate limiting
- **Data Flow:** Kaggle CSV → MongoDB → Backend API → Frontend UI

The system is designed for scalability, performance, and maintainability, with comprehensive error handling and optimization strategies throughout.

