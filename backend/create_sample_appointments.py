#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta

# Add the project directory to the Python path
sys.path.append('/Users/mahesh/swaruchii/silaiwala/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'silaiwala_backend.settings')
django.setup()

from appointments.models import Customer, Appointment
from services.models import Service

def create_sample_appointments():
    # Create sample customers
    customers = [
        {
            'name': 'Rajesh Kumar',
            'email': 'rajesh@example.com',
            'phone': '+91 98765 43210',
            'address': '123 MG Road, Bangalore'
        },
        {
            'name': 'Priya Sharma',
            'email': 'priya@example.com',
            'phone': '+91 98765 43211',
            'address': '456 Brigade Road, Bangalore'
        },
        {
            'name': 'Amit Patel',
            'email': 'amit@example.com',
            'phone': '+91 98765 43212',
            'address': '789 Koramangala, Bangalore'
        },
        {
            'name': 'Sunita Reddy',
            'email': 'sunita@example.com',
            'phone': '+91 98765 43213',
            'address': '321 Indiranagar, Bangalore'
        }
    ]
    
    # Create customers
    created_customers = []
    for customer_data in customers:
        customer, created = Customer.objects.get_or_create(
            email=customer_data['email'],
            defaults=customer_data
        )
        created_customers.append(customer)
        if created:
            print(f"Created customer: {customer.name}")
    
    # Get services
    services = Service.objects.all()
    if not services.exists():
        print("No services found. Please run populate_sample_data first.")
        return
    
    # Create sample appointments
    appointments_data = [
        {
            'customer': created_customers[0],
            'service': services.first(),
            'scheduled_date': datetime.now().date() + timedelta(days=3),
            'scheduled_time': '10:00:00',
            'notes': 'Need formal shirt for office',
            'status': 'confirmed'
        },
        {
            'customer': created_customers[1],
            'service': services.first(),
            'scheduled_date': datetime.now().date() + timedelta(days=4),
            'scheduled_time': '14:00:00',
            'notes': 'Designer blouse for wedding',
            'status': 'pending'
        },
        {
            'customer': created_customers[2],
            'service': services.first(),
            'scheduled_date': datetime.now().date() + timedelta(days=2),
            'scheduled_time': '11:00:00',
            'notes': 'Business suit for interview',
            'status': 'completed'
        },
        {
            'customer': created_customers[3],
            'service': services.first(),
            'scheduled_date': datetime.now().date() + timedelta(days=5),
            'scheduled_time': '15:00:00',
            'notes': 'Dress alteration for party',
            'status': 'pending'
        }
    ]
    
    # Create appointments
    for appointment_data in appointments_data:
        appointment, created = Appointment.objects.get_or_create(
            customer=appointment_data['customer'],
            scheduled_date=appointment_data['scheduled_date'],
            scheduled_time=appointment_data['scheduled_time'],
            defaults=appointment_data
        )
        if created:
            print(f"Created appointment for {appointment.customer.name} on {appointment.scheduled_date}")
    
    print(f"Created {len(created_customers)} customers and {len(appointments_data)} appointments")

if __name__ == '__main__':
    create_sample_appointments()
