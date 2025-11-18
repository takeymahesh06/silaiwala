from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
import logging

from services.models import Service, PricingArea
from orders.models import OrderItem
from .services.pricing_calculator import SmartPricingService
from .services.pricing_ml import PricingMLService, PricingOptimizationService
from .models import (
    PricingFactor, PricingRule, PricingHistory, 
    DynamicPricing, CustomerPricingProfile
)

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_dynamic_price(request):
    """Calculate dynamic price for a service"""
    try:
        service_id = request.data.get('service_id')
        area_id = request.data.get('area_id')
        customer_id = request.data.get('customer_id')
        order_context = request.data.get('order_context', {})
        
        if not service_id or not area_id:
            return Response({
                'status': 'error',
                'message': 'service_id and area_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate service and area exist
        service = get_object_or_404(Service, id=service_id)
        area = get_object_or_404(PricingArea, id=area_id)
        
        # Calculate dynamic price
        pricing_service = SmartPricingService()
        result = pricing_service.calculate_dynamic_price(
            service_id, area_id, customer_id, order_context
        )
        
        if result['status'] == 'success':
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in calculate_dynamic_price: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_service_pricing(request, service_id):
    """Get pricing for a service across all areas"""
    try:
        service = get_object_or_404(Service, id=service_id)
        areas = PricingArea.objects.filter(is_active=True)
        
        pricing_data = []
        pricing_service = SmartPricingService()
        
        for area in areas:
            result = pricing_service.calculate_dynamic_price(service_id, area.id)
            
            if result['status'] == 'success':
                pricing_data.append({
                    'area_id': area.id,
                    'area_name': area.name,
                    'area_multiplier': float(area.multiplier),
                    'base_price': result['base_price'],
                    'calculated_price': result['calculated_price'],
                    'price_multiplier': result['price_multiplier'],
                    'confidence_score': result['confidence_score'],
                    'factors_applied': result['factors_applied']
                })
        
        return Response({
            'status': 'success',
            'service': {
                'id': service.id,
                'name': service.name,
                'category': service.category.name,
                'difficulty_level': service.difficulty_level,
                'estimated_days': service.estimated_days
            },
            'pricing_data': pricing_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_service_pricing: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_pricing_recommendations(request, service_id):
    """Get AI-powered pricing recommendations for a service"""
    try:
        service = get_object_or_404(Service, id=service_id)
        
        optimization_service = PricingOptimizationService()
        result = optimization_service.optimize_pricing_for_service(service_id)
        
        if result['status'] == 'success':
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in get_pricing_recommendations: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_pricing_model(request):
    """Train the ML pricing model"""
    try:
        ml_service = PricingMLService()
        result = ml_service.train_pricing_model()
        
        if result['status'] == 'success':
            return Response({
                'status': 'success',
                'message': 'Pricing model trained successfully',
                'model_info': {
                    'best_model': result['best_model'],
                    'metrics': result['metrics'],
                    'model_version': ml_service.model_version
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in train_pricing_model: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_pricing_factors(request):
    """Get all pricing factors"""
    try:
        factors = PricingFactor.objects.filter(is_active=True)
        
        factors_data = []
        for factor in factors:
            factors_data.append({
                'id': factor.id,
                'name': factor.name,
                'factor_type': factor.factor_type,
                'weight': factor.weight,
                'multiplier_range': {
                    'min': factor.multiplier_range_min,
                    'max': factor.multiplier_range_max
                }
            })
        
        return Response({
            'status': 'success',
            'factors': factors_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_pricing_factors: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_pricing_history(request):
    """Get pricing history for analysis"""
    try:
        service_id = request.GET.get('service_id')
        area_id = request.GET.get('area_id')
        limit = int(request.GET.get('limit', 50))
        
        queryset = PricingHistory.objects.all()
        
        if service_id:
            queryset = queryset.filter(service_id=service_id)
        if area_id:
            queryset = queryset.filter(area_id=area_id)
        
        history = queryset.order_by('-created_at')[:limit]
        
        history_data = []
        for record in history:
            history_data.append({
                'id': record.id,
                'service': record.service.name,
                'area': record.area.name,
                'base_price': float(record.base_price),
                'final_price': float(record.final_price),
                'price_ratio': float(record.final_price) / float(record.base_price),
                'order_volume': record.order_volume,
                'success_rate': record.success_rate,
                'complexity_score': record.complexity_score,
                'season': record.season,
                'created_at': record.created_at
            })
        
        return Response({
            'status': 'success',
            'history': history_data,
            'total_records': queryset.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_pricing_history: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_customer_pricing_profile(request, customer_id):
    """Get customer pricing profile"""
    try:
        from appointments.models import Customer
        customer = get_object_or_404(Customer, id=customer_id)
        
        try:
            profile = CustomerPricingProfile.objects.get(customer=customer)
        except CustomerPricingProfile.DoesNotExist:
            # Create profile if it doesn't exist
            pricing_service = SmartPricingService()
            profile = pricing_service._get_or_create_customer_profile(customer)
        
        profile_data = {
            'customer_id': customer.id,
            'customer_name': customer.name,
            'loyalty_tier': profile.loyalty_tier,
            'discount_percentage': profile.discount_percentage,
            'total_orders': profile.total_orders,
            'average_order_value': float(profile.average_order_value),
            'payment_reliability_score': profile.payment_reliability_score,
            'preferred_services': list(profile.preferred_services.values_list('name', flat=True)),
            'last_order_date': profile.last_order_date,
            'created_at': profile.created_at,
            'updated_at': profile.updated_at
        }
        
        return Response({
            'status': 'success',
            'profile': profile_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_customer_pricing_profile: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def update_pricing_history_from_order(request):
    """Update pricing history from completed order"""
    try:
        order_item_id = request.data.get('order_item_id')
        
        if not order_item_id:
            return Response({
                'status': 'error',
                'message': 'order_item_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order_item = get_object_or_404(OrderItem, id=order_item_id)
        
        pricing_service = SmartPricingService()
        pricing_service.update_pricing_history(order_item)
        
        return Response({
            'status': 'success',
            'message': 'Pricing history updated successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in update_pricing_history_from_order: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_pricing_analytics(request):
    """Get pricing analytics and insights"""
    try:
        # Get basic statistics
        total_services = Service.objects.count()
        total_areas = PricingArea.objects.count()
        total_pricing_records = DynamicPricing.objects.count()
        total_history_records = PricingHistory.objects.count()
        
        # Get recent pricing trends
        recent_pricing = DynamicPricing.objects.filter(
            is_active=True
        ).order_by('-created_at')[:10]
        
        recent_data = []
        for record in recent_pricing:
            recent_data.append({
                'service': record.service.name,
                'area': record.area.name,
                'base_price': float(record.base_price),
                'calculated_price': float(record.calculated_price),
                'confidence_score': record.confidence_score,
                'created_at': record.created_at
            })
        
        # Get pricing factors usage
        factors_usage = {}
        for factor in PricingFactor.objects.filter(is_active=True):
            factors_usage[factor.name] = {
                'type': factor.factor_type,
                'weight': factor.weight,
                'multiplier_range': {
                    'min': factor.multiplier_range_min,
                    'max': factor.multiplier_range_max
                }
            }
        
        return Response({
            'status': 'success',
            'analytics': {
                'summary': {
                    'total_services': total_services,
                    'total_areas': total_areas,
                    'total_pricing_records': total_pricing_records,
                    'total_history_records': total_history_records
                },
                'recent_pricing': recent_data,
                'pricing_factors': factors_usage
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_pricing_analytics: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)