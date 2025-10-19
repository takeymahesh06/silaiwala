from rest_framework import serializers
from .models import Customer, Appointment, Measurement, Tailor, Availability
from services.serializers import ServiceSerializer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'address', 'area', 'created_at']


class AvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Availability
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_available']


class TailorSerializer(serializers.ModelSerializer):
    availability = AvailabilitySerializer(many=True, read_only=True)
    specializations = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Tailor
        fields = [
            'id', 'name', 'phone', 'email', 'expertise_level',
            'specializations', 'availability', 'is_active'
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'customer', 'customer_name', 'customer_phone', 'service',
            'service_name', 'scheduled_date', 'scheduled_time', 'duration_minutes',
            'status', 'status_display', 'notes', 'created_at'
        ]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments with customer data"""
    customer_data = CustomerSerializer(write_only=True)

    class Meta:
        model = Appointment
        fields = [
            'service', 'scheduled_date', 'scheduled_time', 'duration_minutes',
            'notes', 'customer_data'
        ]

    def create(self, validated_data):
        customer_data = validated_data.pop('customer_data')
        
        # Get or create customer
        customer, created = Customer.objects.get_or_create(
            phone=customer_data['phone'],
            defaults=customer_data
        )
        
        # Create appointment
        appointment = Appointment.objects.create(
            customer=customer,
            **validated_data
        )
        return appointment


class MeasurementSerializer(serializers.ModelSerializer):
    appointment_details = AppointmentSerializer(source='appointment', read_only=True)

    class Meta:
        model = Measurement
        fields = [
            'id', 'appointment', 'appointment_details', 'measurements',
            'notes', 'taken_by', 'created_at'
        ]


class AvailableSlotsSerializer(serializers.Serializer):
    """Serializer for available appointment slots"""
    date = serializers.DateField()
    time_slots = serializers.ListField(
        child=serializers.TimeField()
    )
