from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from services.models import Service, ServicePricing, PricingArea
from orders.models import Order
from appointments.models import Customer
import json


class PricingFactor(models.Model):
    """Factors that influence pricing calculations"""
    FACTOR_TYPES = [
        ('seasonal', 'Seasonal Demand'),
        ('fabric_complexity', 'Fabric Complexity'),
        ('customer_loyalty', 'Customer Loyalty'),
        ('urgency', 'Urgency Level'),
        ('competition', 'Competition Factor'),
        ('economic', 'Economic Factor'),
        ('skill_level', 'Required Skill Level'),
        ('volume', 'Order Volume'),
    ]
    
    name = models.CharField(max_length=100)
    factor_type = models.CharField(max_length=30, choices=FACTOR_TYPES)
    weight = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Weight of this factor in pricing calculation (0.0 to 1.0)"
    )
    multiplier_range_min = models.FloatField(
        validators=[MinValueValidator(0.1)],
        help_text="Minimum multiplier value"
    )
    multiplier_range_max = models.FloatField(
        validators=[MinValueValidator(0.1)],
        help_text="Maximum multiplier value"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['factor_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.factor_type})"


class PricingRule(models.Model):
    """Rules for pricing calculations"""
    RULE_TYPES = [
        ('if_then', 'If-Then Rule'),
        ('threshold', 'Threshold Rule'),
        ('percentage', 'Percentage Rule'),
        ('fixed', 'Fixed Amount Rule'),
    ]
    
    name = models.CharField(max_length=200)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    condition = models.JSONField(help_text="Condition logic in JSON format")
    action = models.JSONField(help_text="Action to take when condition is met")
    priority = models.IntegerField(default=0, help_text="Higher number = higher priority")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-priority', 'name']

    def __str__(self):
        return f"{self.name} (Priority: {self.priority})"


class PricingHistory(models.Model):
    """Historical pricing data for ML training"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    area = models.ForeignKey(PricingArea, on_delete=models.CASCADE)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    factors = models.JSONField(help_text="Factors that influenced this pricing")
    customer_segment = models.CharField(max_length=50, blank=True)
    order_volume = models.IntegerField(default=1)
    season = models.CharField(max_length=20, blank=True)
    fabric_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    complexity_score = models.FloatField(null=True, blank=True)
    success_rate = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True,
        help_text="Customer satisfaction/order success rate"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.service.name} - ₹{self.final_price} ({self.created_at.date()})"


class DynamicPricing(models.Model):
    """Dynamic pricing calculations"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    area = models.ForeignKey(PricingArea, on_delete=models.CASCADE)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    calculated_price = models.DecimalField(max_digits=10, decimal_places=2)
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="ML model confidence in this pricing"
    )
    factors_applied = models.JSONField(help_text="Factors and their impact")
    pricing_version = models.CharField(max_length=20, default="v1.0")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['service', 'area', 'pricing_version']

    def __str__(self):
        return f"{self.service.name} - ₹{self.calculated_price} (Confidence: {self.confidence_score:.2f})"


class PricingPrediction(models.Model):
    """ML model predictions for pricing"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    area = models.ForeignKey(PricingArea, on_delete=models.CASCADE)
    predicted_price = models.DecimalField(max_digits=10, decimal_places=2)
    prediction_accuracy = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    model_version = models.CharField(max_length=20)
    input_features = models.JSONField(help_text="Features used for prediction")
    prediction_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-prediction_date']

    def __str__(self):
        return f"{self.service.name} - Predicted: ₹{self.predicted_price}"


class CustomerPricingProfile(models.Model):
    """Customer-specific pricing profiles"""
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE)
    loyalty_tier = models.CharField(max_length=20, choices=[
        ('new', 'New Customer'),
        ('regular', 'Regular Customer'),
        ('vip', 'VIP Customer'),
        ('wholesale', 'Wholesale Customer'),
    ], default='new')
    discount_percentage = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(50.0)],
        default=0.0,
        help_text="Maximum discount percentage for this customer"
    )
    preferred_services = models.ManyToManyField(Service, blank=True)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    last_order_date = models.DateTimeField(null=True, blank=True)
    payment_reliability_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        default=1.0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-loyalty_tier', '-average_order_value']

    def __str__(self):
        return f"{self.customer.name} - {self.loyalty_tier}"


class PricingAudit(models.Model):
    """Audit trail for pricing changes"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    area = models.ForeignKey(PricingArea, on_delete=models.CASCADE)
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    change_reason = models.TextField()
    changed_by = models.CharField(max_length=200)
    change_type = models.CharField(max_length=20, choices=[
        ('manual', 'Manual Adjustment'),
        ('ai', 'AI Recommendation'),
        ('rule', 'Rule-based Change'),
        ('seasonal', 'Seasonal Adjustment'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.service.name} - ₹{self.old_price} → ₹{self.new_price}"