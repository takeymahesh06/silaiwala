#!/bin/bash

echo "🚀 Deploying SilaiWala to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"

# Initialize project if not already done
if [ ! -f "railway.toml" ]; then
    echo "📁 Initializing Railway project..."
    railway init
fi

# Deploy backend
echo "🔧 Deploying backend service..."
cd backend

# Set environment variables for backend
echo "🔧 Setting backend environment variables..."
railway variables set SECRET_KEY=your-secret-key-here-$(date +%s)
railway variables set DEBUG=False
railway variables set ALLOWED_HOSTS=*.railway.app
railway variables set CORS_ALLOWED_ORIGINS=https://silaiwala-frontend-production.up.railway.app

# Deploy backend
railway up --service backend

echo "✅ Backend deployed!"

# Deploy frontend
echo "🎨 Deploying frontend service..."
cd ../frontend

# Set environment variables for frontend
echo "🎨 Setting frontend environment variables..."
railway variables set NEXT_PUBLIC_DJANGO_API_URL=https://silaiwala-backend-production.up.railway.app
railway variables set NEXTAUTH_SECRET=your-nextauth-secret-$(date +%s)
railway variables set NEXTAUTH_URL=https://silaiwala-frontend-production.up.railway.app

# Deploy frontend
railway up --service frontend

echo "✅ Frontend deployed!"

# Show deployment status
echo "📊 Deployment Status:"
railway status

echo "🌐 Your application is now live!"
echo "Backend: https://silaiwala-backend-production.up.railway.app"
echo "Frontend: https://silaiwala-frontend-production.up.railway.app"
echo "Admin: https://silaiwala-backend-production.up.railway.app/admin/"
echo "API: https://silaiwala-backend-production.up.railway.app/api/"