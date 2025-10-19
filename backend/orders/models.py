from django.db import models
from django.core.validators import MinValueValidator
from services.models import Service, ServicePricing
from appointments.models import Customer, Appointment


class Order(models.Model):
    """Main order model for tailoring services"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('ready_for_fitting', 'Ready for Fitting'),
        ('fitting_completed', 'Fitting Completed'),
        ('final_stage', 'Final Stage'),
        ('completed', 'Completed'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial Payment'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]

    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Pricing
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    
    # Dates
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    
    # Additional information
    special_instructions = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-order_date']

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number
            import datetime
            today = datetime.date.today()
            count = Order.objects.filter(order_date__date=today).count() + 1
            self.order_number = f"SW{today.strftime('%Y%m%d')}{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number} - {self.customer.name}"

    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount


class OrderItem(models.Model):
    """Individual items within an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    service_pricing = models.ForeignKey(ServicePricing, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Custom specifications
    specifications = models.JSONField(default=dict, blank=True)
    fabric_details = models.TextField(blank=True)
    color = models.CharField(max_length=100, blank=True)
    size = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order.order_number} - {self.service.name} x{self.quantity}"


class OrderStatusUpdate(models.Model):
    """Track status changes and updates for orders"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_updates')
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    updated_by = models.CharField(max_length=200)  # Staff member name
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order.order_number} - {self.old_status} → {self.new_status}"


class Payment(models.Model):
    """Payment records for orders"""
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('netbanking', 'Net Banking'),
        ('wallet', 'Wallet'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment of ₹{self.amount} for Order {self.order.order_number}"


class Delivery(models.Model):
    """Delivery information and tracking"""
    DELIVERY_TYPES = [
        ('pickup', 'Customer Pickup'),
        ('home_delivery', 'Home Delivery'),
        ('courier', 'Courier'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPES, default='pickup')
    delivery_address = models.TextField()
    contact_person = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=17)
    scheduled_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    delivery_notes = models.TextField(blank=True)
    is_delivered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Delivery for Order {self.order.order_number}"