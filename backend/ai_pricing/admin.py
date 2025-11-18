from django.contrib import admin
from .models import (
    PricingFactor, PricingRule, PricingHistory, 
    DynamicPricing, PricingPrediction, CustomerPricingProfile,
    PricingAudit
)


@admin.register(PricingFactor)
class PricingFactorAdmin(admin.ModelAdmin):
    list_display = ['name', 'factor_type', 'weight', 'multiplier_range_min', 'multiplier_range_max', 'is_active']
    list_filter = ['factor_type', 'is_active']
    search_fields = ['name', 'factor_type']
    ordering = ['factor_type', 'name']


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'rule_type', 'priority', 'is_active', 'created_at']
    list_filter = ['rule_type', 'is_active', 'priority']
    search_fields = ['name', 'rule_type']
    ordering = ['-priority', 'name']


@admin.register(PricingHistory)
class PricingHistoryAdmin(admin.ModelAdmin):
    list_display = ['service', 'area', 'base_price', 'final_price', 'order_volume', 'success_rate', 'created_at']
    list_filter = ['service__category', 'area', 'season', 'customer_segment', 'created_at']
    search_fields = ['service__name', 'area__name']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(DynamicPricing)
class DynamicPricingAdmin(admin.ModelAdmin):
    list_display = ['service', 'area', 'base_price', 'calculated_price', 'confidence_score', 'is_active', 'created_at']
    list_filter = ['service__category', 'area', 'is_active', 'pricing_version', 'created_at']
    search_fields = ['service__name', 'area__name']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(PricingPrediction)
class PricingPredictionAdmin(admin.ModelAdmin):
    list_display = ['service', 'area', 'predicted_price', 'prediction_accuracy', 'model_version', 'prediction_date']
    list_filter = ['service__category', 'area', 'model_version', 'prediction_date']
    search_fields = ['service__name', 'area__name']
    ordering = ['-prediction_date']
    readonly_fields = ['prediction_date']


@admin.register(CustomerPricingProfile)
class CustomerPricingProfileAdmin(admin.ModelAdmin):
    list_display = ['customer', 'loyalty_tier', 'discount_percentage', 'total_orders', 'average_order_value', 'payment_reliability_score']
    list_filter = ['loyalty_tier', 'created_at']
    search_fields = ['customer__name', 'customer__phone']
    ordering = ['-loyalty_tier', '-average_order_value']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PricingAudit)
class PricingAuditAdmin(admin.ModelAdmin):
    list_display = ['service', 'area', 'old_price', 'new_price', 'change_type', 'changed_by', 'created_at']
    list_filter = ['change_type', 'created_at']
    search_fields = ['service__name', 'area__name', 'changed_by']
    ordering = ['-created_at']
    readonly_fields = ['created_at']