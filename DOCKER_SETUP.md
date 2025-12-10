# Docker Setup Guide

This guide will help you run the entire YouTube Trends Analytics project with a single command using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)
- At least 4GB of free disk space

## Quick Start

### 1. Start All Services

```bash
docker-compose up
```

This will:
- Start MongoDB database
- Build and start the backend server
- Build and start the frontend client

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 3. Stop All Services

```bash
docker-compose down
```

## Detailed Commands

### Build and Start (First Time)

```bash
# Build images and start containers
docker-compose up --build
```

### Start in Background (Detached Mode)

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Stop Services

```bash
# Stop but keep containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes database data)
docker-compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all services
docker-compose up --build -d
```

## Importing Dataset

After starting the services, you need to import the dataset:

### Option 1: Using Docker Exec

```bash
# Copy dataset files to MongoDB container
docker cp data/kaggle youtube-trends-mongodb:/tmp/

# Execute import script inside container
docker exec -it youtube-trends-mongodb bash
# Then run your import script
```

### Option 2: Using Local Script (Recommended)

Keep MongoDB running in Docker, but run import script locally:

```bash
# Make sure MongoDB is running
docker-compose up -d mongodb

# Run import script locally (requires Node.js)
cd data
node importDataset.js
```

## Environment Variables

### Backend Environment Variables

Edit `docker-compose.yml` to modify:

- `MONGODB_URI`: MongoDB connection string
- `PORT`: Backend server port (default: 5000)
- `NODE_ENV`: Environment mode (production/development)

### Frontend Environment Variables

Edit `docker-compose.yml` to modify:

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000/api)

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Kill process or change port in docker-compose.yml
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

### Database Connection Issues

```bash
# Check MongoDB is healthy
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Rebuild Everything

```bash
# Stop and remove all
docker-compose down -v

# Remove images
docker rmi youtube-trends-backend youtube-trends-frontend

# Rebuild from scratch
docker-compose up --build
```

## Development vs Production

### Development Mode

For development, you might want to:
- Mount source code as volumes for hot reload
- Use development environment variables
- Enable debug logging

### Production Mode

The current setup is optimized for production:
- Multi-stage builds for smaller images
- Production dependencies only
- Nginx for frontend serving
- Health checks enabled

## File Structure

```
.
├── docker-compose.yml          # Main orchestration file
├── server/
│   ├── Dockerfile             # Backend Docker image
│   └── .dockerignore          # Files to exclude from build
├── client/
│   ├── Dockerfile             # Frontend Docker image
│   ├── nginx.conf             # Nginx configuration
│   └── .dockerignore          # Files to exclude from build
└── DOCKER_SETUP.md            # This file
```

## Next Steps

1. Start services: `docker-compose up`
2. Import dataset (see Importing Dataset section)
3. Access frontend at http://localhost:3000
4. Enjoy your fully containerized application! 🎉

