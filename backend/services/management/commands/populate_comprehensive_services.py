from django.core.management.base import BaseCommand
from services.models import ServiceCategory, Service, PricingArea, ServicePricing
from appointments.models import Tailor, Availability
from users.models import User


class Command(BaseCommand):
    help = 'Populate the database with comprehensive service data'

    def handle(self, *args, **options):
        self.stdout.write('Creating comprehensive service data...')

        # Create superuser if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@silaiwala.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created admin user (admin/admin123)'))

        # Create service categories
        categories_data = [
            {'name': "Women's Wear", 'description': 'Comprehensive tailoring services for women'},
            {'name': "Men's Wear", 'description': 'Professional tailoring for men'},
            {'name': "Kids' Wear", 'description': 'Custom kids clothing and uniforms'},
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

        # Create Women's Wear services
        women_services_data = [
            {
                'category': "Women's Wear",
                'name': 'Alteration Work',
                'description': 'Button, zip, hook, or lining replacement — quick and precise, Add padding, shape adjustments, or fancy piping for a designer touch.',
                'difficulty_level': 'basic',
                'estimated_days': 2
            },
            {
                'category': "Women's Wear",
                'name': 'Blouse Stitching',
                'description': 'Tailored to perfection — padded, non-padded, or fully lined.',
                'difficulty_level': 'intermediate',
                'estimated_days': 5
            },
            {
                'category': "Women's Wear",
                'name': 'Lehenga & Skirts',
                'description': 'Custom-fit lehengas with can-can, panels. Designed for every celebration.',
                'difficulty_level': 'expert',
                'estimated_days': 15
            },
            {
                'category': "Women's Wear",
                'name': 'Salwar & Kurtis',
                'description': 'Made-to-measure kurtis, salwars, and dupatta finishing. Choose from classic, Anarkali, or Indo-western styles.',
                'difficulty_level': 'intermediate',
                'estimated_days': 7
            },
            {
                'category': "Women's Wear",
                'name': 'Gowns & Dresses',
                'description': 'Western and Indo-western gowns crafted with precision — perfect fit, flow, and finish.',
                'difficulty_level': 'advanced',
                'estimated_days': 10
            },
            {
                'category': "Women's Wear",
                'name': 'Trousers',
                'description': 'Corporate trousers to normal pants.',
                'difficulty_level': 'basic',
                'estimated_days': 4
            },
            {
                'category': "Women's Wear",
                'name': 'Saree Services',
                'description': 'From saree fall and pico to pre-stitched drapes and blouse attachment — we handle it all.',
                'difficulty_level': 'intermediate',
                'estimated_days': 6
            },
            {
                'category': "Women's Wear",
                'name': 'Bridal & Occasion Wear',
                'description': 'Couture craftsmanship for your big day — bridal lehengas, gowns, or sherwanis.',
                'difficulty_level': 'expert',
                'estimated_days': 20
            },
            {
                'category': "Women's Wear",
                'name': 'Couture Finishing',
                'description': 'Luxury Couture work, designer pieces.',
                'difficulty_level': 'expert',
                'estimated_days': 25
            }
        ]

        # Create Men's Wear services
        men_services_data = [
            {
                'category': "Men's Wear",
                'name': 'Shirt Stitching',
                'description': 'Formal or casual shirts tailored to your fit and fabric — perfect collars, cuffs, and detailing.',
                'difficulty_level': 'intermediate',
                'estimated_days': 5
            },
            {
                'category': "Men's Wear",
                'name': 'Trousers & Pants',
                'description': 'Professional finishing with elastic, zip, or hook closures. Choose formal, chinos, or casual fits.',
                'difficulty_level': 'basic',
                'estimated_days': 4
            },
            {
                'category': "Men's Wear",
                'name': 'Ethnic Wear',
                'description': 'Classic kurtas, pathanis, sherwanis, and Nehru jackets — bespoke tailoring for every occasion.',
                'difficulty_level': 'advanced',
                'estimated_days': 8
            },
            {
                'category': "Men's Wear",
                'name': 'Alterations',
                'description': 'Perfect fit guaranteed — waist, sleeves, tapering, zips, or re-stitching.',
                'difficulty_level': 'basic',
                'estimated_days': 2
            }
        ]

        # Create Kids' Wear services
        kids_services_data = [
            {
                'category': "Kids' Wear",
                'name': 'Custom Kidswear',
                'description': 'From playful frocks to ethnic sets — made for comfort, movement, and style.',
                'difficulty_level': 'intermediate',
                'estimated_days': 5
            },
            {
                'category': "Kids' Wear",
                'name': 'Uniforms',
                'description': 'School and activity uniforms with long-lasting stitches and perfect fits.',
                'difficulty_level': 'basic',
                'estimated_days': 4
            }
        ]

        # Combine all services
        all_services_data = women_services_data + men_services_data + kids_services_data

        services = {}
        for service_data in all_services_data:
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

        # Create service pricing with realistic base prices
        base_prices = {
            # Women's Wear
            'Alteration Work': 300,
            'Blouse Stitching': 800,
            'Lehenga & Skirts': 2500,
            'Salwar & Kurtis': 1200,
            'Gowns & Dresses': 2000,
            'Trousers': 600,
            'Saree Services': 500,
            'Bridal & Occasion Wear': 5000,
            'Couture Finishing': 8000,
            
            # Men's Wear
            'Shirt Stitching': 800,
            'Trousers & Pants': 700,
            'Ethnic Wear': 1500,
            'Alterations': 250,
            
            # Kids' Wear
            'Custom Kidswear': 500,
            'Uniforms': 400,
        }

        for service_name, base_price in base_prices.items():
            if service_name in services:
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
                'name': 'Rutuja Arle',
                'phone': '+91 98765 43210',
                'email': 'rutuja@silaiwala.com',
                'expertise_level': 'master'
            },
            {
                'name': 'Rajesh Kumar',
                'phone': '+91 98765 43211',
                'email': 'rajesh@silaiwala.com',
                'expertise_level': 'expert'
            },
            {
                'name': 'Priya Sharma',
                'phone': '+91 98765 43212',
                'email': 'priya@silaiwala.com',
                'expertise_level': 'expert'
            },
            {
                'name': 'Amit Patel',
                'phone': '+91 98765 43213',
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

        self.stdout.write(self.style.SUCCESS('Comprehensive service data created successfully!'))
