from django.contrib import admin
from .models import Customer, Appointment, Measurement, Tailor, Availability


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'area', 'created_at']
    list_filter = ['area', 'created_at']
    search_fields = ['name', 'phone', 'email', 'area']
    ordering = ['name']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['customer', 'service', 'scheduled_date', 'scheduled_time', 'status']
    list_filter = ['status', 'scheduled_date', 'service', 'created_at']
    search_fields = ['customer__name', 'customer__phone', 'service__name']
    ordering = ['scheduled_date', 'scheduled_time']


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'taken_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['appointment__customer__name', 'taken_by']
    ordering = ['-created_at']


@admin.register(Tailor)
class TailorAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'expertise_level', 'is_active']
    list_filter = ['expertise_level', 'is_active', 'created_at']
    search_fields = ['name', 'phone', 'email']
    ordering = ['name']


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ['tailor', 'day_of_week', 'start_time', 'end_time', 'is_available']
    list_filter = ['day_of_week', 'is_available', 'tailor']
    search_fields = ['tailor__name']
    ordering = ['tailor', 'day_of_week', 'start_time']