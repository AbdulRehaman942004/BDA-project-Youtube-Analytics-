@echo off
echo 🚀 Setting up YouTube Trends Analytics...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment file...
    copy env.example .env
    echo ⚠️  Please edit .env file and add your YouTube API key!
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist logs mkdir logs
if not exist data mkdir data

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file and add your YouTube API key
echo 2. Run 'npm run docker:dev' to start development environment
echo 3. Visit http://localhost:3000 for the frontend
echo 4. Visit http://localhost:5000/api/health for the API health check
echo 5. Visit http://localhost:8081 for MongoDB admin interface (admin/admin123)
