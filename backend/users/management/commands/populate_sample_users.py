from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import TailorProfile, StaffProfile, CustomerProfile, Permission, RolePermission
from services.models import Service

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate sample users for different roles'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample users...')

        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@silaiwala.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_verified': True,
                'phone': '+91 98765 00001',
                'address': 'SilaiWala Headquarters, Bangalore'
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Created admin user: {admin_user.username}')

        # Create staff users
        staff_users_data = [
            {
                'username': 'manager1',
                'email': 'manager1@silaiwala.com',
                'first_name': 'Rajesh',
                'last_name': 'Kumar',
                'phone': '+91 98765 00002',
                'address': '123 MG Road, Bangalore',
                'department': 'operations',
                'employee_id': 'EMP001',
                'salary': 50000.00
            },
            {
                'username': 'staff1',
                'email': 'staff1@silaiwala.com',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'phone': '+91 98765 00003',
                'address': '456 Brigade Road, Bangalore',
                'department': 'customer_service',
                'employee_id': 'EMP002',
                'salary': 35000.00
            }
        ]

        for staff_data in staff_users_data:
            user, created = User.objects.get_or_create(
                username=staff_data['username'],
                defaults={
                    'email': staff_data['email'],
                    'first_name': staff_data['first_name'],
                    'last_name': staff_data['last_name'],
                    'role': 'staff',
                    'is_verified': True,
                    'phone': staff_data['phone'],
                    'address': staff_data['address']
                }
            )
            if created:
                user.set_password('staff123')
                user.save()
                
                # Create staff profile
                from datetime import date
                StaffProfile.objects.create(
                    user=user,
                    department=staff_data['department'],
                    employee_id=staff_data['employee_id'],
                    hire_date=date.today(),
                    salary=staff_data['salary'],
                    manager=admin_user if staff_data['department'] == 'operations' else None
                )
                self.stdout.write(f'Created staff user: {user.username}')

        # Create tailor users
        tailor_users_data = [
            {
                'username': 'tailor1',
                'email': 'tailor1@silaiwala.com',
                'first_name': 'Amit',
                'last_name': 'Patel',
                'phone': '+91 98765 00004',
                'address': '789 Koramangala, Bangalore',
                'expertise_level': 'expert',
                'experience_years': 8,
                'bio': 'Expert tailor with 8 years of experience in formal wear',
                'hourly_rate': 500.00,
                'specializations': ['formal_wear', 'suits']
            },
            {
                'username': 'tailor2',
                'email': 'tailor2@silaiwala.com',
                'first_name': 'Sunita',
                'last_name': 'Reddy',
                'phone': '+91 98765 00005',
                'address': '321 Indiranagar, Bangalore',
                'expertise_level': 'intermediate',
                'experience_years': 4,
                'bio': 'Skilled tailor specializing in women\'s wear and alterations',
                'hourly_rate': 350.00,
                'specializations': ['womens_wear', 'alterations']
            }
        ]

        for tailor_data in tailor_users_data:
            user, created = User.objects.get_or_create(
                username=tailor_data['username'],
                defaults={
                    'email': tailor_data['email'],
                    'first_name': tailor_data['first_name'],
                    'last_name': tailor_data['last_name'],
                    'role': 'tailor',
                    'is_verified': True,
                    'phone': tailor_data['phone'],
                    'address': tailor_data['address']
                }
            )
            if created:
                user.set_password('tailor123')
                user.save()
                
                # Create tailor profile
                tailor_profile = TailorProfile.objects.create(
                    user=user,
                    expertise_level=tailor_data['expertise_level'],
                    experience_years=tailor_data['experience_years'],
                    bio=tailor_data['bio'],
                    hourly_rate=tailor_data['hourly_rate'],
                    is_available=True
                )
                # Get or create specializations
                specializations = []
                for spec_name in tailor_data['specializations']:
                    spec, created = Service.objects.get_or_create(
                        name=spec_name,
                        defaults={'description': f'{spec_name} specialization'}
                    )
                    specializations.append(spec)
                tailor_profile.specializations.set(specializations)
                self.stdout.write(f'Created tailor user: {user.username}')

        # Create customer users
        customer_users_data = [
            {
                'username': 'customer1',
                'email': 'customer1@example.com',
                'first_name': 'Ravi',
                'last_name': 'Singh',
                'phone': '+91 98765 00006',
                'address': '555 Whitefield, Bangalore',
                'preferred_contact_method': 'phone',
                'notes': 'Prefers formal wear, regular customer'
            },
            {
                'username': 'customer2',
                'email': 'customer2@example.com',
                'first_name': 'Meera',
                'last_name': 'Joshi',
                'phone': '+91 98765 00007',
                'address': '777 HSR Layout, Bangalore',
                'preferred_contact_method': 'email',
                'notes': 'Likes designer wear, occasional customer'
            }
        ]

        for customer_data in customer_users_data:
            user, created = User.objects.get_or_create(
                username=customer_data['username'],
                defaults={
                    'email': customer_data['email'],
                    'first_name': customer_data['first_name'],
                    'last_name': customer_data['last_name'],
                    'role': 'customer',
                    'is_verified': True,
                    'phone': customer_data['phone'],
                    'address': customer_data['address']
                }
            )
            if created:
                user.set_password('customer123')
                user.save()
                
                # Create customer profile
                CustomerProfile.objects.create(
                    user=user,
                    preferred_contact_method=customer_data['preferred_contact_method'],
                    notes=customer_data['notes']
                )
                self.stdout.write(f'Created customer user: {user.username}')

        # Create permissions
        permissions_data = [
            ('view_appointments', 'Can view appointments'),
            ('add_appointments', 'Can add appointments'),
            ('change_appointments', 'Can change appointments'),
            ('delete_appointments', 'Can delete appointments'),
            ('view_orders', 'Can view orders'),
            ('add_orders', 'Can add orders'),
            ('change_orders', 'Can change orders'),
            ('delete_orders', 'Can delete orders'),
            ('view_users', 'Can view users'),
            ('add_users', 'Can add users'),
            ('change_users', 'Can change users'),
            ('delete_users', 'Can delete users'),
            ('view_services', 'Can view services'),
            ('add_services', 'Can add services'),
            ('change_services', 'Can change services'),
            ('delete_services', 'Can delete services'),
        ]

        for codename, name in permissions_data:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                defaults={'name': name}
            )
            if created:
                self.stdout.write(f'Created permission: {permission.name}')

        # Create role permissions
        role_permissions = {
            'admin': ['view_appointments', 'add_appointments', 'change_appointments', 'delete_appointments',
                     'view_orders', 'add_orders', 'change_orders', 'delete_orders',
                     'view_users', 'add_users', 'change_users', 'delete_users',
                     'view_services', 'add_services', 'change_services', 'delete_services'],
            'staff': ['view_appointments', 'add_appointments', 'change_appointments',
                     'view_orders', 'add_orders', 'change_orders',
                     'view_users', 'view_services'],
            'tailor': ['view_appointments', 'change_appointments',
                      'view_orders', 'change_orders'],
            'customer': ['view_appointments', 'add_appointments',
                        'view_orders', 'add_orders']
        }

        for role, permission_codenames in role_permissions.items():
            for codename in permission_codenames:
                try:
                    permission = Permission.objects.get(codename=codename)
                    role_permission, created = RolePermission.objects.get_or_create(
                        role=role,
                        permission=permission
                    )
                    if created:
                        self.stdout.write(f'Created role permission: {role} - {permission.name}')
                except Permission.DoesNotExist:
                    self.stdout.write(f'Permission {codename} not found')

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample users and permissions!')
        )
