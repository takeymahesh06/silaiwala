from django.db import models
from django.core.validators import MinValueValidator


class ServiceCategory(models.Model):
    """Categories of tailoring services (e.g., Shirts, Blouses, Suits)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='service_categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Service Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class Service(models.Model):
    """Individual tailoring services within a category"""
    DIFFICULTY_LEVELS = [
        ('basic', 'Basic'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=200)
    description = models.TextField()
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='basic')
    estimated_days = models.PositiveIntegerField(default=7)
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class PricingArea(models.Model):
    """Different areas/zones for pricing variations"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.00,
                                   validators=[MinValueValidator(0.1)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ServicePricing(models.Model):
    """Pricing for services based on area and complexity"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='pricing')
    area = models.ForeignKey(PricingArea, on_delete=models.CASCADE, related_name='service_pricing')
    base_price = models.DecimalField(max_digits=10, decimal_places=2,
                                   validators=[MinValueValidator(0)])
    final_price = models.DecimalField(max_digits=10, decimal_places=2,
                                    validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['service', 'area']
        ordering = ['service', 'area']

    def save(self, *args, **kwargs):
        # Calculate final price based on area multiplier
        self.final_price = self.base_price * self.area.multiplier
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.service.name} - {self.area.name}: ₹{self.final_price}"


class ServiceRequirement(models.Model):
    """Specific requirements or measurements needed for a service"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='requirements')
    name = models.CharField(max_length=200)
    description = models.TextField()
    is_required = models.BooleanField(default=True)
    input_type = models.CharField(max_length=50, choices=[
        ('text', 'Text'),
        ('number', 'Number'),
        ('select', 'Select'),
        ('file', 'File Upload'),
    ], default='text')
    options = models.JSONField(blank=True, null=True)  # For select type inputs
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.service.name} - {self.name}"