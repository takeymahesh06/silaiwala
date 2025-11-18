# 🚀 Railway Deployment Guide for SilaiWala

## Step 1: Login to Railway

### Option A: Interactive Login (Recommended)
```bash
railway login
# This will open your browser for authentication
```

### Option B: Token Login
1. Go to https://railway.app/account/tokens
2. Create a new token
3. Run: `railway login --token YOUR_TOKEN_HERE`

## Step 2: Initialize Project

```bash
# Initialize Railway project
railway init

# This creates a railway.toml file
```

## Step 3: Deploy Backend

```bash
# Navigate to backend directory
cd backend

# Deploy backend service
railway up --service backend

# Set environment variables
railway variables set SECRET_KEY=your-secret-key-here
railway variables set DEBUG=False
railway variables set ALLOWED_HOSTS=*.railway.app
railway variables set CORS_ALLOWED_ORIGINS=https://your-frontend-domain.railway.app
```

## Step 4: Deploy Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Deploy frontend service
railway up --service frontend

# Set environment variables
railway variables set NEXT_PUBLIC_DJANGO_API_URL=https://your-backend-domain.railway.app
railway variables set NEXTAUTH_SECRET=your-nextauth-secret
railway variables set NEXTAUTH_URL=https://your-frontend-domain.railway.app
```

## Step 5: Add Database Services

### Add PostgreSQL Database
```bash
# Add PostgreSQL service
railway add postgresql

# Get database URL
railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Add Redis Cache
```bash
# Add Redis service
railway add redis

# Get Redis URL
railway variables set REDIS_URL=${{Redis.REDIS_URL}}
```

## Step 6: Check Deployment Status

```bash
# Check project status
railway status

# View logs
railway logs

# Check variables
railway variables
```

## Environment Variables Required

### Backend Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - Django secret key
- `DEBUG` - Set to False for production
- `ALLOWED_HOSTS` - Set to *.railway.app
- `CORS_ALLOWED_ORIGINS` - Frontend domain

### Frontend Variables:
- `NEXT_PUBLIC_DJANGO_API_URL` - Backend API URL
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Frontend domain

## Quick Deploy Script

Run the deployment script:
```bash
./deploy-railway.sh
```

## Troubleshooting

### Common Issues:

1. **Login Failed**: Use `railway login` and authenticate via browser
2. **Build Failed**: Check Dockerfile and requirements.txt
3. **Database Connection**: Ensure PostgreSQL service is added
4. **Environment Variables**: Set all required variables
5. **Port Issues**: Railway uses $PORT environment variable

### Debug Commands:
```bash
# Check logs
railway logs

# Check status
railway status

# Check variables
railway variables

# Redeploy
railway up
```

## URLs After Deployment

- **Backend API**: https://silaiwala-backend-production.up.railway.app
- **Frontend**: https://silaiwala-frontend-production.up.railway.app
- **Admin Panel**: https://silaiwala-backend-production.up.railway.app/admin/
- **API Docs**: https://silaiwala-backend-production.up.railway.app/api/

## Default Credentials

- **Admin**: admin / admin123
- **API**: Available at /api/ endpoints
