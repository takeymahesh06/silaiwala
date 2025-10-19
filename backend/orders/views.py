from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderItem, OrderStatusUpdate, Payment, Delivery
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderDetailSerializer,
    OrderItemSerializer, OrderStatusUpdateSerializer, PaymentSerializer, DeliverySerializer
)


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for orders"""
    queryset = Order.objects.all().select_related('customer', 'appointment').prefetch_related('items')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'customer']
    search_fields = ['order_number', 'customer__name', 'customer__phone']
    ordering_fields = ['order_date', 'expected_delivery_date', 'total_amount']
    ordering = ['-order_date']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderSerializer

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        updated_by = request.data.get('updated_by', 'System')
        
        if not new_status:
            return Response({'error': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create status update record
        OrderStatusUpdate.objects.create(
            order=order,
            old_status=order.status,
            new_status=new_status,
            notes=notes,
            updated_by=updated_by
        )
        
        # Update order status
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """Add payment to an order"""
        order = self.get_object()
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')
        transaction_id = request.data.get('transaction_id', '')
        notes = request.data.get('notes', '')
        
        if not amount or not payment_method:
            return Response(
                {'error': 'amount and payment_method are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create payment record
        payment = Payment.objects.create(
            order=order,
            amount=amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            notes=notes
        )
        
        # Update order paid amount
        order.paid_amount += float(amount)
        
        # Update payment status
        if order.paid_amount >= order.total_amount:
            order.payment_status = 'paid'
        elif order.paid_amount > 0:
            order.payment_status = 'partial'
        
        order.save()
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """Get all payments for an order"""
        order = self.get_object()
        payments = order.payments.all()
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def status_updates(self, request, pk=None):
        """Get all status updates for an order"""
        order = self.get_object()
        updates = order.status_updates.all()
        serializer = OrderStatusUpdateSerializer(updates, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def setup_delivery(self, request, pk=None):
        """Setup delivery for an order"""
        order = self.get_object()
        
        # Check if delivery already exists
        if hasattr(order, 'delivery'):
            return Response(
                {'error': 'Delivery already set up for this order'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        delivery_data = request.data
        delivery_data['order'] = order.id
        
        serializer = DeliverySerializer(data=delivery_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """Mark order as delivered"""
        order = self.get_object()
        
        if not hasattr(order, 'delivery'):
            return Response(
                {'error': 'Delivery not set up for this order'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        delivery = order.delivery
        delivery.is_delivered = True
        delivery.actual_delivery_date = request.data.get('delivery_date')
        delivery.delivery_notes = request.data.get('notes', delivery.delivery_notes)
        delivery.save()
        
        # Update order status
        order.status = 'delivered'
        order.actual_delivery_date = delivery.actual_delivery_date
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get orders grouped by status"""
        status = request.query_params.get('status')
        if status:
            orders = self.queryset.filter(status=status)
        else:
            orders = self.queryset
        
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_delivery(self, request):
        """Get orders pending delivery"""
        orders = self.queryset.filter(
            status='completed',
            delivery__is_delivered=False
        )
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)


class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for order items"""
    queryset = OrderItem.objects.all().select_related('order', 'service', 'service_pricing')
    serializer_class = OrderItemSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['order', 'service']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for payments"""
    queryset = Payment.objects.all().select_related('order')
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['order', 'payment_method']
    ordering_fields = ['payment_date', 'amount']
    ordering = ['-payment_date']


class DeliveryViewSet(viewsets.ModelViewSet):
    """ViewSet for deliveries"""
    queryset = Delivery.objects.all().select_related('order')
    serializer_class = DeliverySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['delivery_type', 'is_delivered']
    ordering_fields = ['scheduled_date', 'actual_delivery_date']
    ordering = ['-scheduled_date']