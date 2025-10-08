#!/bin/bash

# YouTube Trends Analytics Setup Script

echo "🚀 Setting up YouTube Trends Analytics..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "⚠️  Please edit .env file and add your YouTube API key!"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p data

# Set permissions
chmod +x scripts/*.sh

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your YouTube API key"
echo "2. Run 'npm run docker:dev' to start development environment"
echo "3. Visit http://localhost:3000 for the frontend"
echo "4. Visit http://localhost:5000/api/health for the API health check"
echo "5. Visit http://localhost:8081 for MongoDB admin interface (admin/admin123)"
