# Environment Variables for SilaiWala Deployment

## Required Environment Variables

### Backend Service (Django API)

#### Core Django Settings
```
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-here
ALLOWED_HOSTS=silaiwala-backend.onrender.com
```

#### Database Configuration
```
POSTGRES_DB=silaiwala_prod
POSTGRES_USER=silaiwala_user
POSTGRES_PASSWORD=your-database-password
POSTGRES_HOST=your-postgres-host.onrender.com
POSTGRES_PORT=5432
```

#### CORS Configuration
```
CORS_ALLOWED_ORIGINS=https://silaiwala-frontend.onrender.com
```

#### Redis Cache (Optional but Recommended)
```
REDIS_URL=redis://your-redis-host.onrender.com:6379/0
```

#### Email Configuration (Optional)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@silaiwala.com
```

### Frontend Service (NextJS)

#### API Configuration
```
NEXT_PUBLIC_DJANGO_API_URL=https://silaiwala-backend.onrender.com
```

## How to Set Environment Variables in Render

### Method 1: Using Render Dashboard

1. Go to your service in Render dashboard
2. Click on "Environment" tab
3. Add each variable with its value
4. Click "Save Changes"

### Method 2: Using render.yaml (Infrastructure as Code)

The `render.yaml` file I created will automatically set most variables, but you need to:

1. **Generate a SECRET_KEY**:
   ```python
   import secrets
   print(secrets.token_urlsafe(50))
   ```

2. **Get database credentials** from your PostgreSQL service in Render

3. **Update render.yaml** with actual values

## Environment Variables by Service

### 1. Backend Service Environment Variables

```bash
# Django Core
DEBUG=False
SECRET_KEY=your-generated-secret-key
ALLOWED_HOSTS=silaiwala-backend.onrender.com

# Database (from PostgreSQL service)
POSTGRES_DB=silaiwala_prod
POSTGRES_USER=silaiwala_user
POSTGRES_PASSWORD=auto-generated-by-render
POSTGRES_HOST=auto-generated-by-render
POSTGRES_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://silaiwala-frontend.onrender.com

# Redis (from Redis service)
REDIS_URL=auto-generated-by-render

# Optional: Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@silaiwala.com
```

### 2. Frontend Service Environment Variables

```bash
# API URL
NEXT_PUBLIC_DJANGO_API_URL=https://silaiwala-backend.onrender.com
```

## Security Best Practices

### 1. Secret Key Generation
```python
# Generate a secure secret key
import secrets
import string

def generate_secret_key():
    return ''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%^&*(-_=+)') for _ in range(50))

print(generate_secret_key())
```

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict network access

### 3. CORS Security
- Only allow your frontend domain
- Don't use wildcards in production

## Step-by-Step Setup in Render

### Step 1: Create Services
1. Create PostgreSQL database service
2. Create Redis service (optional)
3. Create backend web service
4. Create frontend static site

### Step 2: Configure Backend Environment Variables
```bash
# Copy these to your backend service
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=silaiwala-backend.onrender.com
POSTGRES_DB=silaiwala_prod
POSTGRES_USER=silaiwala_user
POSTGRES_PASSWORD=from-database-service
POSTGRES_HOST=from-database-service
POSTGRES_PORT=5432
CORS_ALLOWED_ORIGINS=https://silaiwala-frontend.onrender.com
REDIS_URL=from-redis-service
```

### Step 3: Configure Frontend Environment Variables
```bash
# Copy this to your frontend service
NEXT_PUBLIC_DJANGO_API_URL=https://silaiwala-backend.onrender.com
```

## Testing Environment Variables

### Backend API Test
```bash
curl https://silaiwala-backend.onrender.com/api/services/categories/
```

### Frontend Test
Visit: `https://silaiwala-frontend.onrender.com`

## Common Issues and Solutions

### 1. CORS Errors
**Problem**: Frontend can't access backend API
**Solution**: Add frontend URL to `CORS_ALLOWED_ORIGINS`

### 2. Database Connection Errors
**Problem**: Backend can't connect to database
**Solution**: Check database credentials and network access

### 3. Build Failures
**Problem**: Service fails to build
**Solution**: Check build logs and environment variables

### 4. Static Files Not Loading
**Problem**: CSS/JS files not loading
**Solution**: Ensure `whitenoise` is in requirements.txt

## Environment Variables Checklist

- [ ] SECRET_KEY generated and set
- [ ] DEBUG set to False
- [ ] ALLOWED_HOSTS configured
- [ ] Database credentials set
- [ ] CORS origins configured
- [ ] Redis URL set (if using)
- [ ] Frontend API URL set
- [ ] Email settings configured (if using)

## Production vs Development

### Development (Local)
```bash
DEBUG=True
SECRET_KEY=dev-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### Production (Render)
```bash
DEBUG=False
SECRET_KEY=secure-production-key
ALLOWED_HOSTS=your-domain.onrender.com
POSTGRES_DB=production-db
POSTGRES_USER=production-user
POSTGRES_PASSWORD=secure-password
```

## Monitoring Environment Variables

Use Render's dashboard to:
- Monitor service health
- View environment variable values
- Check service logs
- Update variables as needed

Remember: Never commit sensitive environment variables to your Git repository!
