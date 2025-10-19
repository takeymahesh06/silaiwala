#!/bin/bash

# SilaiWala Development Startup Script

echo "🚀 Starting SilaiWala Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Start the development environment
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ SilaiWala is now running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "👨‍💼 Admin Panel: http://localhost:8000/admin"
