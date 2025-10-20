from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    """Custom User model with role-based access"""
    
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('tailor', 'Tailor'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")],
        blank=True
    )
    address = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Override Django's default is_staff and is_superuser to work with our custom model
    is_staff = models.BooleanField(
        default=False,
        help_text='Designates whether the user can log into this admin site.',
    )
    is_superuser = models.BooleanField(
        default=False,
        help_text='Designates that this user has all permissions without explicitly assigning them.',
    )
    
    # Fix reverse accessor conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="custom_user_set",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_set",
        related_query_name="custom_user",
    )
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_customer(self):
        return self.role == 'customer'
    
    @property
    def is_tailor(self):
        return self.role == 'tailor'
    
    @property
    def is_admin(self):
        return self.role == 'admin'


class TailorProfile(models.Model):
    """Extended profile for tailors"""
    
    EXPERTISE_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tailor_profile')
    expertise_level = models.CharField(max_length=20, choices=EXPERTISE_LEVEL_CHOICES, default='beginner')
    experience_years = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    is_available = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_orders = models.PositiveIntegerField(default=0)
    specializations = models.ManyToManyField('services.Service', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_expertise_level_display()}"


class StaffProfile(models.Model):
    """Extended profile for staff members"""
    
    DEPARTMENT_CHOICES = [
        ('customer_service', 'Customer Service'),
        ('operations', 'Operations'),
        ('quality_control', 'Quality Control'),
        ('logistics', 'Logistics'),
        ('management', 'Management'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    department = models.CharField(max_length=30, choices=DEPARTMENT_CHOICES)
    employee_id = models.CharField(max_length=20, unique=True)
    hire_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_department_display()}"


class CustomerProfile(models.Model):
    """Extended profile for customers"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[('phone', 'Phone'), ('email', 'Email'), ('sms', 'SMS')],
        default='phone'
    )
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    loyalty_points = models.PositiveIntegerField(default=0)
    preferred_tailor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='preferred_customers')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Customer"


class UserSession(models.Model):
    """Track user sessions for security and analytics"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    login_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time}"


class Permission(models.Model):
    """Custom permissions for role-based access control"""
    
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class RolePermission(models.Model):
    """Link roles to permissions"""
    
    role = models.CharField(max_length=20, choices=User.ROLE_CHOICES)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['role', 'permission']
    
    def __str__(self):
        return f"{self.get_role_display()} - {self.permission.name}"