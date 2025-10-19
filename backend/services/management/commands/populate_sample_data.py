from django.core.management.base import BaseCommand
from services.models import ServiceCategory, Service, PricingArea, ServicePricing, ServiceRequirement
from appointments.models import Tailor, Availability
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create superuser if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@silaiwala.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created admin user (admin/admin123)'))

        # Create service categories
        categories_data = [
            {'name': 'Shirts', 'description': 'Custom-fitted shirts for men and women'},
            {'name': 'Blouses', 'description': 'Elegant blouses for women'},
            {'name': 'Suits', 'description': 'Formal suits and blazers'},
            {'name': 'Alterations', 'description': 'Professional alteration services'},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = ServiceCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create services
        services_data = [
            {
                'category': 'Shirts',
                'name': 'Formal Shirt',
                'description': 'Classic formal shirt with precise measurements',
                'difficulty_level': 'basic',
                'estimated_days': 5
            },
            {
                'category': 'Shirts',
                'name': 'Casual Shirt',
                'description': 'Comfortable casual shirt for everyday wear',
                'difficulty_level': 'basic',
                'estimated_days': 4
            },
            {
                'category': 'Blouses',
                'name': 'Office Blouse',
                'description': 'Professional blouse for office wear',
                'difficulty_level': 'intermediate',
                'estimated_days': 6
            },
            {
                'category': 'Blouses',
                'name': 'Party Blouse',
                'description': 'Elegant blouse for special occasions',
                'difficulty_level': 'advanced',
                'estimated_days': 8
            },
            {
                'category': 'Suits',
                'name': 'Business Suit',
                'description': 'Professional business suit',
                'difficulty_level': 'expert',
                'estimated_days': 12
            },
            {
                'category': 'Alterations',
                'name': 'Basic Alteration',
                'description': 'Simple alterations like hemming and fitting',
                'difficulty_level': 'basic',
                'estimated_days': 2
            },
        ]

        services = {}
        for service_data in services_data:
            service, created = Service.objects.get_or_create(
                name=service_data['name'],
                defaults={
                    'category': categories[service_data['category']],
                    'description': service_data['description'],
                    'difficulty_level': service_data['difficulty_level'],
                    'estimated_days': service_data['estimated_days']
                }
            )
            services[service_data['name']] = service
            if created:
                self.stdout.write(f'Created service: {service.name}')

        # Create pricing areas
        areas_data = [
            {'name': 'Central', 'description': 'Central business district', 'multiplier': 1.2},
            {'name': 'North', 'description': 'North side of the city', 'multiplier': 1.0},
            {'name': 'South', 'description': 'South side of the city', 'multiplier': 0.9},
            {'name': 'East', 'description': 'East side of the city', 'multiplier': 0.8},
            {'name': 'West', 'description': 'West side of the city', 'multiplier': 1.1},
        ]

        areas = {}
        for area_data in areas_data:
            area, created = PricingArea.objects.get_or_create(
                name=area_data['name'],
                defaults=area_data
            )
            areas[area_data['name']] = area
            if created:
                self.stdout.write(f'Created area: {area.name}')

        # Create service pricing
        base_prices = {
            'Formal Shirt': 800,
            'Casual Shirt': 600,
            'Office Blouse': 700,
            'Party Blouse': 1200,
            'Business Suit': 3000,
            'Basic Alteration': 200,
        }

        for service_name, base_price in base_prices.items():
            service = services[service_name]
            for area_name, area in areas.items():
                ServicePricing.objects.get_or_create(
                    service=service,
                    area=area,
                    defaults={'base_price': base_price}
                )

        # Create tailors
        tailors_data = [
            {
                'name': 'Rajesh Kumar',
                'phone': '+91 98765 43210',
                'email': 'rajesh@silaiwala.com',
                'expertise_level': 'master'
            },
            {
                'name': 'Priya Sharma',
                'phone': '+91 98765 43211',
                'email': 'priya@silaiwala.com',
                'expertise_level': 'expert'
            },
            {
                'name': 'Amit Patel',
                'phone': '+91 98765 43212',
                'email': 'amit@silaiwala.com',
                'expertise_level': 'senior'
            },
        ]

        for tailor_data in tailors_data:
            tailor, created = Tailor.objects.get_or_create(
                phone=tailor_data['phone'],
                defaults=tailor_data
            )
            if created:
                # Add specializations
                tailor.specializations.set(Service.objects.all())
                self.stdout.write(f'Created tailor: {tailor.name}')

                # Create availability (Monday to Saturday, 9 AM to 6 PM)
                for day in range(6):  # Monday to Saturday
                    Availability.objects.get_or_create(
                        tailor=tailor,
                        day_of_week=day,
                        defaults={
                            'start_time': '09:00',
                            'end_time': '18:00',
                            'is_available': True
                        }
                    )

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
