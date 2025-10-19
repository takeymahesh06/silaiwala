from django.contrib import admin
from .models import Order, OrderItem, OrderStatusUpdate, Payment, Delivery


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderStatusUpdateInline(admin.TabularInline):
    model = OrderStatusUpdate
    extra = 0
    readonly_fields = ['created_at']


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ['payment_date']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'status', 'payment_status', 'total_amount', 'order_date']
    list_filter = ['status', 'payment_status', 'order_date', 'created_at']
    search_fields = ['order_number', 'customer__name', 'customer__phone']
    ordering = ['-order_date']
    inlines = [OrderItemInline, OrderStatusUpdateInline, PaymentInline]
    readonly_fields = ['order_number', 'created_at', 'updated_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'service', 'quantity', 'unit_price', 'total_price']
    list_filter = ['service', 'created_at']
    search_fields = ['order__order_number', 'service__name']
    ordering = ['-created_at']


@admin.register(OrderStatusUpdate)
class OrderStatusUpdateAdmin(admin.ModelAdmin):
    list_display = ['order', 'old_status', 'new_status', 'updated_by', 'created_at']
    list_filter = ['new_status', 'created_at']
    search_fields = ['order__order_number', 'updated_by']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'amount', 'payment_method', 'payment_date']
    list_filter = ['payment_method', 'payment_date']
    search_fields = ['order__order_number', 'transaction_id']
    ordering = ['-payment_date']
    readonly_fields = ['payment_date']


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['order', 'delivery_type', 'scheduled_date', 'is_delivered']
    list_filter = ['delivery_type', 'is_delivered', 'scheduled_date']
    search_fields = ['order__order_number', 'contact_person', 'contact_phone']
    ordering = ['-scheduled_date']
    readonly_fields = ['created_at']