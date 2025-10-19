# SilaiWala Deployment Guide - Render

This guide will help you deploy the SilaiWala application to Render.

## Prerequisites

1. A GitHub account with the SilaiWala repository
2. A Render account (free tier available)
3. The repository should be pushed to GitHub

## Deployment Steps

### 1. Create Render Account and Connect GitHub

1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account
3. Import the SilaiWala repository

### 2. Deploy Backend (Django API)

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the backend service:
   - **Name**: `silaiwala-backend`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     cd backend && pip install -r requirements.txt && python manage.py migrate && python manage.py populate_sample_users
     ```
   - **Start Command**: 
     ```bash
     cd backend && gunicorn silaiwala_backend.wsgi:application
     ```
   - **Plan**: Free

4. Add Environment Variables:
   ```
   DEBUG=False
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=silaiwala-backend.onrender.com
   ```

### 3. Create PostgreSQL Database

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `silaiwala-db`
   - **Plan**: Free
   - **Database**: `silaiwala_prod`
   - **User**: `silaiwala_user`

3. Copy the database connection details

### 4. Create Redis Cache (Optional)

1. In Render dashboard, click "New +" → "Redis"
2. Configure:
   - **Name**: `silaiwala-redis`
   - **Plan**: Free

### 5. Update Backend Environment Variables

Add these to your backend service:
```
POSTGRES_DB=silaiwala_prod
POSTGRES_USER=silaiwala_user
POSTGRES_PASSWORD=your-db-password
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432
REDIS_URL=your-redis-url
```

### 6. Deploy Frontend (NextJS)

1. In Render dashboard, click "New +" → "Static Site"
2. Configure:
   - **Name**: `silaiwala-frontend`
   - **Build Command**: 
     ```bash
     cd frontend && npm install && npm run build
     ```
   - **Publish Directory**: `frontend/out`
   - **Plan**: Free

3. Add Environment Variable:
   ```
   NEXT_PUBLIC_DJANGO_API_URL=https://silaiwala-backend.onrender.com
   ```

### 7. Update CORS Settings

In your backend service, add the frontend URL to CORS:
```
CORS_ALLOWED_ORIGINS=https://silaiwala-frontend.onrender.com
```

## Environment Variables Summary

### Backend Service
```
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=silaiwala-backend.onrender.com
POSTGRES_DB=silaiwala_prod
POSTGRES_USER=silaiwala_user
POSTGRES_PASSWORD=your-db-password
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432
REDIS_URL=your-redis-url
CORS_ALLOWED_ORIGINS=https://silaiwala-frontend.onrender.com
```

### Frontend Service
```
NEXT_PUBLIC_DJANGO_API_URL=https://silaiwala-backend.onrender.com
```

## Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain and configure DNS

## SSL Certificates

Render automatically provides SSL certificates for all services.

## Monitoring and Logs

- View logs in the Render dashboard
- Monitor service health and performance
- Set up alerts for downtime

## Troubleshooting

### Common Issues

1. **Build Failures**: Check build logs for dependency issues
2. **Database Connection**: Verify database credentials and network access
3. **CORS Errors**: Ensure frontend URL is in CORS_ALLOWED_ORIGINS
4. **Static Files**: Check if whitenoise is properly configured

### Debug Mode

For debugging, temporarily set:
```
DEBUG=True
```

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Sample data populated
- [ ] CORS settings updated
- [ ] SSL certificates active
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up
- [ ] Backup strategy in place

## Support

For deployment issues:
1. Check Render documentation
2. Review service logs
3. Verify environment variables
4. Test API endpoints manually

## Cost

- Free tier includes:
  - 750 hours/month for web services
  - 1GB PostgreSQL database
  - 25MB Redis cache
  - Static site hosting

For production use, consider upgrading to paid plans for better performance and reliability.
