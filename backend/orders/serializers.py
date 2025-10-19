from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusUpdate, Payment, Delivery
from services.serializers import ServiceSerializer, ServicePricingSerializer
from appointments.serializers import CustomerSerializer, AppointmentSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_details = ServiceSerializer(source='service', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'service', 'service_name', 'service_details', 'service_pricing',
            'quantity', 'unit_price', 'total_price', 'specifications',
            'fabric_details', 'color', 'size'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'customer_phone',
            'appointment', 'status', 'status_display', 'payment_status',
            'payment_status_display', 'total_amount', 'paid_amount',
            'remaining_amount', 'order_date', 'expected_delivery_date',
            'actual_delivery_date', 'special_instructions', 'notes',
            'items', 'created_at'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = OrderItemSerializer(many=True, write_only=True)
    customer_data = CustomerSerializer(write_only=True)

    class Meta:
        model = Order
        fields = [
            'appointment', 'expected_delivery_date', 'special_instructions',
            'notes', 'customer_data', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer_data = validated_data.pop('customer_data')
        
        # Get or create customer
        customer, created = Customer.objects.get_or_create(
            phone=customer_data['phone'],
            defaults=customer_data
        )
        
        # Create order
        order = Order.objects.create(
            customer=customer,
            **validated_data
        )
        
        # Create order items
        total_amount = 0
        for item_data in items_data:
            order_item = OrderItem.objects.create(
                order=order,
                **item_data
            )
            total_amount += order_item.total_price
        
        # Update order total
        order.total_amount = total_amount
        order.save()
        
        return order


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusUpdate
        fields = ['id', 'order', 'old_status', 'new_status', 'notes', 'updated_by', 'created_at']


class PaymentSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'payment_method', 'payment_method_display',
            'transaction_id', 'notes', 'payment_date'
        ]


class DeliverySerializer(serializers.ModelSerializer):
    delivery_type_display = serializers.CharField(source='get_delivery_type_display', read_only=True)

    class Meta:
        model = Delivery
        fields = [
            'id', 'order', 'delivery_type', 'delivery_type_display',
            'delivery_address', 'contact_person', 'contact_phone',
            'scheduled_date', 'actual_delivery_date', 'delivery_notes',
            'is_delivered', 'created_at'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for order with all related data"""
    items = OrderItemSerializer(many=True, read_only=True)
    customer = CustomerSerializer(read_only=True)
    appointment = AppointmentSerializer(read_only=True)
    status_updates = OrderStatusUpdateSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    delivery = DeliverySerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'appointment', 'status',
            'status_display', 'payment_status', 'payment_status_display',
            'total_amount', 'paid_amount', 'remaining_amount',
            'order_date', 'expected_delivery_date', 'actual_delivery_date',
            'special_instructions', 'notes', 'items', 'status_updates',
            'payments', 'delivery', 'created_at', 'updated_at'
        ]
