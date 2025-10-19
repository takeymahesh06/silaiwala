from django.contrib import admin
from .models import ServiceCategory, Service, PricingArea, ServicePricing, ServiceRequirement


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'difficulty_level', 'estimated_days', 'is_active']
    list_filter = ['category', 'difficulty_level', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'category__name']
    ordering = ['category', 'name']


@admin.register(PricingArea)
class PricingAreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'multiplier', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(ServicePricing)
class ServicePricingAdmin(admin.ModelAdmin):
    list_display = ['service', 'area', 'base_price', 'final_price', 'is_active']
    list_filter = ['area', 'is_active', 'created_at']
    search_fields = ['service__name', 'area__name']
    ordering = ['service', 'area']


@admin.register(ServiceRequirement)
class ServiceRequirementAdmin(admin.ModelAdmin):
    list_display = ['name', 'service', 'is_required', 'input_type', 'order']
    list_filter = ['service', 'is_required', 'input_type']
    search_fields = ['name', 'description', 'service__name']
    ordering = ['service', 'order']