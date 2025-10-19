from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime, timedelta, date
from .models import Customer, Appointment, Measurement, Tailor, Availability
from .serializers import (
    CustomerSerializer, AppointmentSerializer, AppointmentCreateSerializer,
    MeasurementSerializer, TailorSerializer, AvailableSlotsSerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for customers"""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone', 'email', 'area']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for appointments"""
    queryset = Appointment.objects.all().select_related('customer', 'service')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'service', 'customer']
    search_fields = ['customer__name', 'customer__phone', 'service__name']
    ordering_fields = ['scheduled_date', 'scheduled_time', 'created_at']
    ordering = ['scheduled_date', 'scheduled_time']

    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """Get available appointment slots for a specific date"""
        date_str = request.query_params.get('date')
        service_id = request.query_params.get('service_id')
        
        if not date_str:
            return Response({'error': 'date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get available tailors for the service
        if service_id:
            tailors = Tailor.objects.filter(
                specializations__id=service_id,
                is_active=True
            ).prefetch_related('availability')
        else:
            tailors = Tailor.objects.filter(is_active=True).prefetch_related('availability')
        
        # Get day of week (0=Monday, 6=Sunday)
        day_of_week = target_date.weekday()
        
        # Generate time slots (9 AM to 6 PM, 1-hour slots)
        time_slots = []
        for hour in range(9, 18):
            time_slots.append(datetime.strptime(f"{hour:02d}:00", "%H:%M").time())
        
        # Filter out booked slots
        booked_appointments = Appointment.objects.filter(
            scheduled_date=target_date,
            status__in=['scheduled', 'confirmed']
        ).values_list('scheduled_time', flat=True)
        
        # Check availability for each tailor
        available_slots = []
        for slot in time_slots:
            slot_datetime = datetime.combine(target_date, slot)
            
            # Check if any tailor is available at this time
            for tailor in tailors:
                availability = tailor.availability.filter(
                    day_of_week=day_of_week,
                    start_time__lte=slot,
                    end_time__gt=slot,
                    is_available=True
                ).exists()
                
                if availability and slot not in booked_appointments:
                    available_slots.append(slot)
                    break
        
        serializer = AvailableSlotsSerializer({
            'date': target_date,
            'time_slots': available_slots
        })
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an appointment"""
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark appointment as completed"""
        appointment = self.get_object()
        appointment.status = 'completed'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)


class MeasurementViewSet(viewsets.ModelViewSet):
    """ViewSet for measurements"""
    queryset = Measurement.objects.all().select_related('appointment')
    serializer_class = MeasurementSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['appointment']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class TailorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for tailors"""
    queryset = Tailor.objects.filter(is_active=True).prefetch_related('specializations', 'availability')
    serializer_class = TailorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['expertise_level']
    search_fields = ['name', 'specializations__name']
    ordering_fields = ['name', 'expertise_level']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def by_expertise(self, request):
        """Get tailors grouped by expertise level"""
        expertise_level = request.query_params.get('expertise_level')
        if expertise_level:
            tailors = self.queryset.filter(expertise_level=expertise_level)
        else:
            tailors = self.queryset
        
        serializer = self.get_serializer(tailors, many=True)
        return Response(serializer.data)