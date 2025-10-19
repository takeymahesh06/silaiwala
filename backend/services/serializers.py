from rest_framework import serializers
from .models import ServiceCategory, Service, PricingArea, ServicePricing, ServiceRequirement


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'image', 'is_active', 'created_at']


class ServiceRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequirement
        fields = ['id', 'name', 'description', 'is_required', 'input_type', 'options', 'order']


class ServiceSerializer(serializers.ModelSerializer):
    requirements = ServiceRequirementSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'category', 'category_name', 'name', 'description', 
            'difficulty_level', 'estimated_days', 'image', 'is_active',
            'requirements', 'created_at'
        ]


class PricingAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingArea
        fields = ['id', 'name', 'description', 'multiplier', 'is_active']


class ServicePricingSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    area_name = serializers.CharField(source='area.name', read_only=True)

    class Meta:
        model = ServicePricing
        fields = [
            'id', 'service', 'service_name', 'area', 'area_name',
            'base_price', 'final_price', 'is_active'
        ]


class ServiceWithPricingSerializer(serializers.ModelSerializer):
    """Serializer for services with pricing information"""
    requirements = ServiceRequirementSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    pricing = ServicePricingSerializer(source='pricing', many=True, read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'difficulty_level', 'estimated_days', 'image', 'is_active',
            'requirements', 'pricing', 'created_at'
        ]
