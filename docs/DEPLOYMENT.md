# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- YouTube Data API v3 key
- Basic knowledge of Docker and web development

## Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd youtube-trends-analytics
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env file and add your YouTube API key
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Development Environment
```bash
# Start development environment
npm run docker:dev

# Or manually with Docker Compose
docker-compose -f docker-compose.dev.yml up --build
```

### 4. Production Environment
```bash
# Start production environment
npm run docker:prod

# Or manually with Docker Compose
docker-compose -f docker-compose.prod.yml up --build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_ROOT_USERNAME` | MongoDB root username | admin |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | password123 |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | Required |
| `NODE_ENV` | Environment mode | development |
| `PORT` | Backend port | 5000 |
| `REACT_APP_API_URL` | Frontend API URL | http://localhost:5000/api |

## Services

### Development Mode
- **Frontend**: http://localhost:3000 (React dev server)
- **Backend**: http://localhost:5000 (Node.js API)
- **MongoDB**: localhost:27017
- **Mongo Express**: http://localhost:8081 (admin/admin123)

### Production Mode
- **Frontend**: http://localhost (Nginx)
- **Backend**: http://localhost:5000 (Node.js API)
- **MongoDB**: localhost:27017

## Database Setup

MongoDB is automatically initialized with:
- Database: `youtube_trends`
- Collections: `videos`, `channels`, `trends`
- Indexes for optimal performance
- Sample user for authentication

## API Endpoints

- Health Check: `GET /api/health`
- Trending Videos: `GET /api/youtube/trending`
- Search Videos: `GET /api/youtube/search`
- Analytics Dashboard: `GET /api/analytics/dashboard`

## Monitoring

### Health Checks
```bash
# Check API health
curl http://localhost:5000/api/health

# Check MongoDB connection
docker exec youtube-trends-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Container Status
```bash
# Check running containers
docker-compose ps

# Restart services
docker-compose restart
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Stop existing services
   docker-compose down
   
   # Or change ports in docker-compose.yml
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB container
   docker logs youtube-trends-mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **YouTube API errors**
   - Verify API key is correct
   - Check API quota limits
   - Ensure API is enabled in Google Cloud Console

4. **Frontend build errors**
   ```bash
   # Clear node_modules and rebuild
   docker-compose down
   docker-compose build --no-cache frontend
   docker-compose up
   ```

### Performance Optimization

1. **MongoDB Indexes**
   - Indexes are automatically created
   - Monitor query performance with MongoDB profiler

2. **API Rate Limiting**
   - Default: 100 requests per 15 minutes
   - Adjust in server configuration if needed

3. **Caching**
   - Frontend assets are cached by Nginx
   - Consider implementing Redis for API caching

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong passwords for production
   - Rotate API keys regularly

2. **Network Security**
   - Use HTTPS in production
   - Configure firewall rules
   - Limit database access

3. **Container Security**
   - Keep Docker images updated
   - Use non-root users in containers
   - Scan images for vulnerabilities

## Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
    # ... other config
```

### Database Scaling
- Use MongoDB replica sets for high availability
- Implement connection pooling
- Consider MongoDB Atlas for managed database

## Backup and Recovery

### Database Backup
```bash
# Backup MongoDB
docker exec youtube-trends-mongodb mongodump --db youtube_trends --out /backup

# Copy backup from container
docker cp youtube-trends-mongodb:/backup ./mongodb-backup
```

### Restore Database
```bash
# Restore from backup
docker exec -i youtube-trends-mongodb mongorestore --db youtube_trends /backup/youtube_trends
```
