# 🚀 Railway Deployment Guide for SilaiWala

## Prerequisites
- Railway CLI installed: `npm install -g @railway/cli`
- Docker Hub images pushed: `takeymahesh06/silaiwala-backend:latest` and `takeymahesh06/silaiwala-frontend:latest`

## Step 1: Login to Railway
```bash
railway login
```
This will open a browser window for authentication.

## Step 2: Initialize Project
```bash
railway init
```
This creates a `railway.toml` file in your project.

## Step 3: Deploy Backend
```bash
cd backend
railway up --service backend
```

## Step 4: Set Backend Environment Variables
```bash
railway variables set SECRET_KEY=your-secret-key-here
railway variables set DEBUG=False
railway variables set ALLOWED_HOSTS=*.railway.app
railway variables set CORS_ALLOWED_ORIGINS=https://your-frontend-domain.railway.app
```

## Step 5: Deploy Frontend
```bash
cd ../frontend
railway up --service frontend
```

## Step 6: Set Frontend Environment Variables
```bash
railway variables set NEXT_PUBLIC_DJANGO_API_URL=https://your-backend-domain.railway.app
railway variables set NEXTAUTH_SECRET=your-nextauth-secret
railway variables set NEXTAUTH_URL=https://your-frontend-domain.railway.app
```

## Step 7: Add Database Services
1. Go to Railway Dashboard: https://railway.app/dashboard
2. Add PostgreSQL service
3. Add Redis service
4. Connect them to your services

## Step 8: Update Database URLs
```bash
# Backend
railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
railway variables set REDIS_URL=${{Redis.REDIS_URL}}
```

## Quick Deploy (Alternative)
```bash
./deploy-railway.sh
```

## Troubleshooting
- Check logs: `railway logs`
- Check status: `railway status`
- Check variables: `railway variables`
- Redeploy: `railway up`

## Expected URLs
- Backend: https://silaiwala-backend-production.up.railway.app
- Frontend: https://silaiwala-frontend-production.up.railway.app
- Admin: https://silaiwala-backend-production.up.railway.app/admin/
- API: https://silaiwala-backend-production.up.railway.app/api/
