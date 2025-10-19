from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceCategory, Service, PricingArea, ServicePricing, ServiceRequirement
from .serializers import (
    ServiceCategorySerializer, ServiceSerializer, ServiceWithPricingSerializer,
    PricingAreaSerializer, ServicePricingSerializer, ServiceRequirementSerializer
)


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for service categories"""
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for services"""
    queryset = Service.objects.filter(is_active=True).select_related('category')
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty_level']
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['name', 'estimated_days', 'created_at']
    ordering = ['category', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceSerializer
        return ServiceWithPricingSerializer

    @action(detail=True, methods=['get'])
    def pricing(self, request, pk=None):
        """Get pricing for a specific service across all areas"""
        service = self.get_object()
        pricing = ServicePricing.objects.filter(service=service, is_active=True)
        serializer = ServicePricingSerializer(pricing, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get services grouped by category"""
        categories = ServiceCategory.objects.filter(is_active=True).prefetch_related('services')
        result = []
        
        for category in categories:
            services = category.services.filter(is_active=True)
            category_data = ServiceCategorySerializer(category).data
            category_data['services'] = ServiceSerializer(services, many=True).data
            result.append(category_data)
        
        return Response(result)


class PricingAreaViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for pricing areas"""
    queryset = PricingArea.objects.filter(is_active=True)
    serializer_class = PricingAreaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'multiplier']
    ordering = ['name']


class ServicePricingViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for service pricing"""
    queryset = ServicePricing.objects.filter(is_active=True).select_related('service', 'area')
    serializer_class = ServicePricingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['service', 'area']
    search_fields = ['service__name', 'area__name']
    ordering_fields = ['final_price', 'base_price']
    ordering = ['service', 'area']

    @action(detail=False, methods=['get'])
    def by_area(self, request):
        """Get pricing for all services in a specific area"""
        area_id = request.query_params.get('area_id')
        if not area_id:
            return Response({'error': 'area_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            area = PricingArea.objects.get(id=area_id, is_active=True)
        except PricingArea.DoesNotExist:
            return Response({'error': 'Area not found'}, status=status.HTTP_404_NOT_FOUND)
        
        pricing = self.queryset.filter(area=area)
        serializer = self.get_serializer(pricing, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def calculate_price(self, request):
        """Calculate price for a service in a specific area"""
        service_id = request.query_params.get('service_id')
        area_id = request.query_params.get('area_id')
        
        if not service_id or not area_id:
            return Response(
                {'error': 'Both service_id and area_id parameters are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pricing = ServicePricing.objects.get(
                service_id=service_id, 
                area_id=area_id, 
                is_active=True
            )
            serializer = self.get_serializer(pricing)
            return Response(serializer.data)
        except ServicePricing.DoesNotExist:
            return Response(
                {'error': 'Pricing not found for this service and area combination'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ServiceRequirementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for service requirements"""
    queryset = ServiceRequirement.objects.all()
    serializer_class = ServiceRequirementSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['service', 'is_required']
    ordering_fields = ['order', 'name']
    ordering = ['order', 'name']