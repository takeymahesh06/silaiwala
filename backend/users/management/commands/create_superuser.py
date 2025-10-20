from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with admin role'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Username for superuser')
        parser.add_argument('--email', type=str, default='admin@silaiwala.com', help='Email for superuser')
        parser.add_argument('--password', type=str, default='admin123', help='Password for superuser')
        parser.add_argument('--phone', type=str, default='+91 98765 00000', help='Phone number for superuser')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        phone = options['phone']

        # Check if superuser already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser with username "{username}" already exists.')
            )
            return

        # Create superuser
        superuser = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Super',
            last_name='Admin',
            role='admin',
            phone=phone,
            address='SilaiWala Headquarters',
            is_verified=True
        )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created superuser "{username}" with admin role.')
        )
        self.stdout.write(f'Username: {username}')
        self.stdout.write(f'Email: {email}')
        self.stdout.write(f'Password: {password}')
        self.stdout.write(f'Role: admin')
