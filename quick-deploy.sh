#!/bin/bash

echo "🚀 Quick Railway Deployment for SilaiWala"

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Please login first: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"

# Initialize if needed
if [ ! -f "railway.toml" ]; then
    echo "📁 Initializing Railway project..."
    railway init
fi

# Deploy backend
echo "🔧 Deploying backend..."
cd backend
railway up --service backend
railway variables set SECRET_KEY=silaiwala-secret-$(date +%s)
railway variables set DEBUG=False
railway variables set ALLOWED_HOSTS=*.railway.app
echo "✅ Backend deployed!"

# Deploy frontend  
echo "🎨 Deploying frontend..."
cd ../frontend
railway up --service frontend
railway variables set NEXT_PUBLIC_DJANGO_API_URL=https://silaiwala-backend-production.up.railway.app
railway variables set NEXTAUTH_SECRET=nextauth-secret-$(date +%s)
railway variables set NEXTAUTH_URL=https://silaiwala-frontend-production.up.railway.app
echo "✅ Frontend deployed!"

# Show status
echo "📊 Deployment Status:"
railway status

echo "🌐 Your app is live!"
echo "Check Railway dashboard for URLs"
