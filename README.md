# SilaiWala - Standardized Tailoring Chain Platform

A comprehensive platform that standardizes the tailoring industry with fixed pricing, trained tailors, and defined delivery timelines.

## Features

- **Service Selection**: Choose from various clothing items (shirt, blouse, etc.)
- **Transparent Pricing**: Fixed pricing based on area and service type
- **Appointment Booking**: Schedule measurement appointments
- **Order Management**: Track orders from placement to delivery
- **Quality Assurance**: Professional presentation and quality checks

## Tech Stack

- **Frontend**: NextJS 14 with TypeScript
- **Backend**: Django 5.0 with Django REST Framework
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS

## Project Structure

```
silaiwala/
├── frontend/          # NextJS application
├── backend/           # Django application
├── docker-compose.yml # Development environment
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL

### Development Setup

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Endpoints

- `/api/services/` - List all available services
- `/api/pricing/` - Get pricing based on area and service
- `/api/appointments/` - Book and manage appointments
- `/api/orders/` - Create and track orders

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
