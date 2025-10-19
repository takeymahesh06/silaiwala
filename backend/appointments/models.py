from django.db import models
from django.core.validators import RegexValidator
from services.models import Service


class Customer(models.Model):
    """Customer information for appointments and orders"""
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )

    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(validators=[phone_regex], max_length=17, unique=True)
    address = models.TextField()
    area = models.CharField(max_length=100)  # For pricing calculation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Appointment(models.Model):
    """Appointment slots for measurements and consultations"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='appointments')
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_date', 'scheduled_time']

    def __str__(self):
        return f"{self.customer.name} - {self.service.name} on {self.scheduled_date}"


class Measurement(models.Model):
    """Measurement data collected during appointments"""
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='measurement')
    measurements = models.JSONField()  # Store all measurements as JSON
    notes = models.TextField(blank=True)
    taken_by = models.CharField(max_length=200)  # Tailor's name
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Measurements for {self.appointment.customer.name} - {self.appointment.service.name}"


class Tailor(models.Model):
    """Tailor information and availability"""
    EXPERTISE_LEVELS = [
        ('junior', 'Junior'),
        ('senior', 'Senior'),
        ('master', 'Master'),
        ('expert', 'Expert'),
    ]

    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=17)
    email = models.EmailField(blank=True, null=True)
    expertise_level = models.CharField(max_length=20, choices=EXPERTISE_LEVELS, default='junior')
    specializations = models.ManyToManyField(Service, blank=True, related_name='tailors')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.expertise_level})"


class Availability(models.Model):
    """Tailor availability schedule"""
    tailor = models.ForeignKey(Tailor, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.IntegerField(choices=[
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['tailor', 'day_of_week', 'start_time']
        ordering = ['tailor', 'day_of_week', 'start_time']

    def __str__(self):
        return f"{self.tailor.name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"