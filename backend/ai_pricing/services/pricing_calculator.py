from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

from services.models import Service, ServicePricing, PricingArea
from orders.models import Order, OrderItem
from appointments.models import Customer
from ..models import (
    PricingFactor, PricingRule, PricingHistory, 
    DynamicPricing, CustomerPricingProfile
)
from .pricing_ml import PricingMLService, PricingOptimizationService

logger = logging.getLogger(__name__)


class SmartPricingService:
    """Main service for smart pricing calculations"""
    
    def __init__(self):
        self.ml_service = PricingMLService()
        self.optimization_service = PricingOptimizationService()
    
    def calculate_dynamic_price(self, service_id: int, area_id: int, 
                              customer_id: Optional[int] = None,
                              order_context: Optional[Dict] = None) -> Dict:
        """Calculate dynamic price for a service"""
        try:
            service = Service.objects.get(id=service_id)
            area = PricingArea.objects.get(id=area_id)
            
            # Get base pricing
            try:
                base_pricing = ServicePricing.objects.get(service=service, area=area)
                base_price = float(base_pricing.base_price)
            except ServicePricing.DoesNotExist:
                return {
                    'status': 'error',
                    'message': 'No base pricing found for this service and area'
                }
            
            # Prepare context for pricing calculation
            pricing_context = self._prepare_pricing_context(
                service, area, customer_id, order_context
            )
            
            # Get ML prediction
            ml_prediction = self.ml_service.predict_price(
                service_id, area_id, pricing_context
            )
            
            if ml_prediction['status'] != 'success':
                # Fallback to rule-based pricing
                calculated_price = self._calculate_rule_based_price(
                    service, area, base_price, pricing_context
                )
                confidence_score = 0.3  # Lower confidence for rule-based
            else:
                calculated_price = ml_prediction['final_price']
                confidence_score = ml_prediction['confidence_score']
            
            # Apply customer-specific adjustments
            if customer_id:
                customer_adjustment = self._get_customer_adjustment(customer_id)
                calculated_price = self._apply_customer_adjustment(
                    calculated_price, customer_adjustment
                )
            
            # Apply seasonal adjustments
            seasonal_adjustment = self._get_seasonal_adjustment()
            calculated_price = self._apply_seasonal_adjustment(
                calculated_price, seasonal_adjustment
            )
            
            # Add fabric cost to the final price
            fabric_cost = pricing_context.get('fabric_cost', 0)
            if fabric_cost and fabric_cost > 0:
                calculated_price += float(fabric_cost)
            
            # Ensure price is within reasonable bounds
            min_price = base_price * 0.5  # Minimum 50% of base price
            max_price = base_price * 2.0  # Maximum 200% of base price
            final_price = max(min_price, min(calculated_price, max_price))
            
            # Create pricing record
            pricing_record = self._create_pricing_record(
                service, area, base_price, final_price, 
                confidence_score, pricing_context
            )
            
            return {
                'status': 'success',
                'service_id': service_id,
                'area_id': area_id,
                'base_price': base_price,
                'calculated_price': round(final_price, 2),
                'price_multiplier': round(final_price / base_price, 2),
                'confidence_score': confidence_score,
                'pricing_record_id': pricing_record.id,
                'factors_applied': self._get_applied_factors_summary(pricing_context),
                'breakdown': {
                    'base_price': base_price,
                    'ml_adjustment': calculated_price - base_price,
                    'customer_adjustment': self._get_customer_adjustment(customer_id) if customer_id else 0,
                    'seasonal_adjustment': seasonal_adjustment,
                    'final_price': final_price
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating dynamic price: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def _prepare_pricing_context(self, service: Service, area: PricingArea,
                               customer_id: Optional[int], 
                               order_context: Optional[Dict]) -> Dict:
        """Prepare context for pricing calculation"""
        context = {
            'service_difficulty': service.difficulty_level,
            'estimated_days': service.estimated_days,
            'area_multiplier': float(area.multiplier),
            'current_month': timezone.now().month,
            'current_year': timezone.now().year,
            'is_peak_season': self._is_peak_season(),
            'order_volume': 1,
            'fabric_cost': 0,
            'urgency_level': 'normal',
            # New parameters with defaults
            'fabric_type': 'cotton',
            'garment_length': 'medium',
            'design_complexity': 'simple',
            'lining_required': 'none',
            'handwork_embroidery': 'none',
            'trims_accessories': 'minimal',
            'fit_adjustments': 'none',
            'special_requirements': False
        }
        
        # Add customer context if available
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
                customer_profile = self._get_or_create_customer_profile(customer)
                
                context.update({
                    'customer_loyalty_tier': customer_profile.loyalty_tier,
                    'customer_total_orders': customer_profile.total_orders,
                    'customer_avg_order_value': float(customer_profile.average_order_value),
                    'customer_payment_reliability': customer_profile.payment_reliability_score,
                    'customer_preferred_services': list(customer_profile.preferred_services.values_list('id', flat=True))
                })
            except Customer.DoesNotExist:
                pass
        
        # Add order context if available
        if order_context:
            context.update({
                'order_volume': order_context.get('quantity', 1),
                'fabric_cost': order_context.get('fabric_cost', 0),
                'urgency_level': order_context.get('urgency', 'normal'),
                'special_requirements': order_context.get('special_requirements', False),
                # New parameters from order context
                'fabric_type': order_context.get('fabric_type', 'cotton'),
                'garment_length': order_context.get('garment_length', 'medium'),
                'design_complexity': order_context.get('design_complexity', 'simple'),
                'lining_required': order_context.get('lining_required', 'none'),
                'handwork_embroidery': order_context.get('handwork_embroidery', 'none'),
                'trims_accessories': order_context.get('trims_accessories', 'minimal'),
                'fit_adjustments': order_context.get('fit_adjustments', 'none'),
            })
        
        return context
    
    def _calculate_rule_based_price(self, service: Service, area: PricingArea,
                                  base_price: float, context: Dict) -> float:
        """Calculate price using business rules"""
        try:
            price = base_price
            
            # Apply area multiplier
            price *= context.get('area_multiplier', 1.0)
            
            # Apply difficulty multiplier
            difficulty_multipliers = {
                'basic': 1.0,
                'intermediate': 1.2,
                'advanced': 1.5,
                'expert': 2.0
            }
            difficulty = context.get('service_difficulty', 'basic')
            price *= difficulty_multipliers.get(difficulty, 1.0)
            
            # Apply fabric type multiplier
            fabric_multipliers = {
                'cotton': 1.0,
                'rayon': 1.1,   # +10% for rayon
                'silk': 1.3,    # +30% for silk
                'wool': 1.2,    # +20% for wool
                'linen': 1.15,  # +15% for linen
                'polyester': 0.95,  # -5% for polyester
                'georgette': 1.25,  # +25% for georgette
                'chiffon': 1.25,    # +25% for chiffon
            }
            fabric_type = context.get('fabric_type', 'cotton').lower()
            price *= fabric_multipliers.get(fabric_type, 1.0)
            
            # Apply garment length multiplier
            length_multipliers = {
                'short': 1.0,
                'medium': 1.1,   # +10% for medium length
                'long': 1.2,     # +20% for long garments
            }
            garment_length = context.get('garment_length', 'medium').lower()
            price *= length_multipliers.get(garment_length, 1.0)
            
            # Apply design complexity multiplier
            design_multipliers = {
                'simple': 1.0,
                'moderate': 1.15,  # +15% for moderate complexity
                'complex': 1.5,    # +50% for complex designs
            }
            design_complexity = context.get('design_complexity', 'simple').lower()
            price *= design_multipliers.get(design_complexity, 1.0)
            
            # Apply lining multiplier
            lining_multipliers = {
                'none': 1.0,
                'partial': 1.1,   # +10% for partial lining
                'full': 1.3,      # +30% for full lining
            }
            lining_required = context.get('lining_required', 'none').lower()
            price *= lining_multipliers.get(lining_required, 1.0)
            
            # Apply handwork/embroidery multiplier
            handwork_multipliers = {
                'none': 1.0,
                'light': 1.1,    # +10% for light handwork
                'heavy': 1.4,    # +40% for heavy embroidery
            }
            handwork = context.get('handwork_embroidery', 'none').lower()
            price *= handwork_multipliers.get(handwork, 1.0)
            
            # Apply trims & accessories multiplier
            trims_multipliers = {
                'minimal': 1.0,
                'moderate': 1.1,  # +10% for moderate trims
                'heavy': 1.2,     # +20% for heavy trims
            }
            trims = context.get('trims_accessories', 'minimal').lower()
            price *= trims_multipliers.get(trims, 1.0)
            
            # Apply fit adjustments multiplier
            fit_multipliers = {
                'none': 1.0,
                'minor': 1.1,        # +10% for 1-point adjustments
                'moderate': 1.2,     # +20% for 2-3 points adjustments
                'major': 1.5,        # +50% for full restructure
            }
            fit_adjustments = context.get('fit_adjustments', 'none').lower()
            price *= fit_multipliers.get(fit_adjustments, 1.0)
            
            # Apply seasonal multiplier
            if context.get('is_peak_season', False):
                price *= 1.3  # 30% increase during peak season
            
            # Apply volume discount
            order_volume = context.get('order_volume', 1)
            if order_volume >= 10:
                price *= 0.85  # 15% discount for large orders (10+)
            elif order_volume >= 5:
                price *= 0.9   # 10% discount for bulk orders (5+)
            
            # Apply urgency multiplier
            urgency_level = context.get('urgency_level', 'normal')
            if urgency_level == 'urgent':
                price *= 1.5  # 50% increase for urgent orders
            elif urgency_level == 'rush':
                price *= 2.0  # 100% increase for rush orders
            
            # Apply special requirements multiplier
            if context.get('special_requirements', False):
                price *= 1.15  # +15% for special requirements
            
            # Add fabric cost to the final price
            fabric_cost = context.get('fabric_cost', 0)
            if fabric_cost and fabric_cost > 0:
                price += float(fabric_cost)
            
            return price
            
        except Exception as e:
            logger.error(f"Error in rule-based pricing: {str(e)}")
            return base_price
    
    def _get_customer_adjustment(self, customer_id: int) -> Dict:
        """Get customer-specific pricing adjustments"""
        try:
            customer_profile = CustomerPricingProfile.objects.get(customer_id=customer_id)
            
            return {
                'discount_percentage': customer_profile.discount_percentage,
                'loyalty_tier': customer_profile.loyalty_tier,
                'payment_reliability': customer_profile.payment_reliability_score
            }
        except CustomerPricingProfile.DoesNotExist:
            return {
                'discount_percentage': 0,
                'loyalty_tier': 'new',
                'payment_reliability': 1.0
            }
    
    def _apply_customer_adjustment(self, price: float, adjustment: Dict) -> float:
        """Apply customer-specific adjustments to price"""
        try:
            # Apply loyalty discount
            discount = adjustment.get('discount_percentage', 0)
            if discount > 0:
                price *= (1 - discount / 100)
            
            # Apply payment reliability adjustment
            reliability = adjustment.get('payment_reliability', 1.0)
            if reliability < 0.8:  # Lower reliability = higher price
                price *= 1.1
            
            return price
            
        except Exception as e:
            logger.error(f"Error applying customer adjustment: {str(e)}")
            return price
    
    def _get_seasonal_adjustment(self) -> float:
        """Get seasonal pricing adjustment"""
        current_month = timezone.now().month
        
        # Define seasonal multipliers
        seasonal_multipliers = {
            1: 0.9,   # January - post-holiday discount
            2: 0.9,   # February - winter discount
            3: 1.0,   # March - normal
            4: 1.0,   # April - normal
            5: 1.0,   # May - normal
            6: 1.0,   # June - normal
            7: 1.0,   # July - normal
            8: 1.1,   # August - festival season starts
            9: 1.2,   # September - festival season
            10: 1.3,  # October - wedding season
            11: 1.4,  # November - peak wedding season
            12: 1.3,  # December - holiday season
        }
        
        return seasonal_multipliers.get(current_month, 1.0)
    
    def _apply_seasonal_adjustment(self, price: float, seasonal_multiplier: float) -> float:
        """Apply seasonal adjustment to price"""
        return price * seasonal_multiplier
    
    def _is_peak_season(self) -> bool:
        """Check if current time is peak season"""
        current_month = timezone.now().month
        peak_months = [8, 9, 10, 11, 12]  # Aug-Dec
        return current_month in peak_months
    
    def _get_or_create_customer_profile(self, customer: Customer) -> CustomerPricingProfile:
        """Get or create customer pricing profile"""
        try:
            profile = CustomerPricingProfile.objects.get(customer=customer)
        except CustomerPricingProfile.DoesNotExist:
            # Calculate customer metrics
            orders = Order.objects.filter(customer=customer)
            total_orders = orders.count()
            avg_order_value = orders.aggregate(avg=Avg('total_amount'))['avg'] or 0
            
            # Determine loyalty tier
            if total_orders >= 20:
                loyalty_tier = 'vip'
            elif total_orders >= 10:
                loyalty_tier = 'regular'
            else:
                loyalty_tier = 'new'
            
            profile = CustomerPricingProfile.objects.create(
                customer=customer,
                loyalty_tier=loyalty_tier,
                total_orders=total_orders,
                average_order_value=avg_order_value,
                discount_percentage=5 if loyalty_tier == 'vip' else 0
            )
        
        return profile
    
    def _create_pricing_record(self, service: Service, area: PricingArea,
                             base_price: float, final_price: float,
                             confidence_score: float, context: Dict) -> DynamicPricing:
        """Create a dynamic pricing record"""
        try:
            # Upsert by unique key (service, area, pricing_version)
            pricing_version = "v1.0"
            pricing_record, _created = DynamicPricing.objects.update_or_create(
                service=service,
                area=area,
                pricing_version=pricing_version,
                defaults={
                    'base_price': base_price,
                    'calculated_price': final_price,
                    'confidence_score': confidence_score,
                    'factors_applied': context,
                    'is_active': True,
                }
            )
            return pricing_record
            
        except Exception as e:
            logger.error(f"Error creating pricing record: {str(e)}")
            raise
    
    def _get_applied_factors_summary(self, context: Dict) -> Dict:
        """Get summary of applied pricing factors"""
        factors = {}
        
        # Difficulty factor
        difficulty = context.get('service_difficulty', 'basic')
        if difficulty in ['advanced', 'expert']:
            factors['difficulty'] = f"{difficulty} level service"
        
        # Fabric type factor
        fabric_type = context.get('fabric_type', 'cotton')
        if fabric_type != 'cotton':
            factors['fabric'] = f"{fabric_type.title()} fabric"
        
        # Design complexity factor
        design_complexity = context.get('design_complexity', 'simple')
        if design_complexity != 'simple':
            factors['design'] = f"{design_complexity} design"
        
        # Lining factor
        lining = context.get('lining_required', 'none')
        if lining != 'none':
            factors['lining'] = f"{lining} lining"
        
        # Handwork/Embroidery factor
        handwork = context.get('handwork_embroidery', 'none')
        if handwork != 'none':
            factors['handwork'] = f"{handwork} handwork"
        
        # Garment length factor
        length = context.get('garment_length', 'medium')
        if length != 'medium':
            factors['length'] = f"{length} length"
        
        # Trims factor
        trims = context.get('trims_accessories', 'minimal')
        if trims != 'minimal':
            factors['trims'] = f"{trims} trims"
        
        # Fit adjustments factor
        fit = context.get('fit_adjustments', 'none')
        if fit != 'none':
            factors['fit'] = f"{fit} fit adjustments"
        
        # Seasonal factor
        if context.get('is_peak_season', False):
            factors['seasonal'] = "Peak season pricing"
        
        # Volume factor
        volume = context.get('order_volume', 1)
        if volume > 1:
            factors['volume'] = f"Bulk order ({volume} items)"
        
        # Urgency factor
        urgency = context.get('urgency_level', 'normal')
        if urgency != 'normal':
            factors['urgency'] = f"{urgency} delivery"
        
        # Special requirements factor
        if context.get('special_requirements', False):
            factors['special'] = "Special requirements"
        
        # Customer factor
        loyalty_tier = context.get('customer_loyalty_tier', 'new')
        if loyalty_tier != 'new':
            factors['customer'] = f"{loyalty_tier} customer discount"
        
        return factors
    
    def get_pricing_recommendations(self, service_id: int) -> Dict:
        """Get pricing recommendations for a service"""
        try:
            return self.optimization_service.optimize_pricing_for_service(service_id)
        except Exception as e:
            logger.error(f"Error getting pricing recommendations: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def update_pricing_history(self, order_item: OrderItem) -> None:
        """Update pricing history with actual order data"""
        try:
            service = order_item.service
            order = order_item.order
            
            # Get area from customer
            area_name = order.customer.area
            try:
                area = PricingArea.objects.get(name=area_name)
            except PricingArea.DoesNotExist:
                area = PricingArea.objects.first()  # Fallback
            
            # Calculate success rate (simplified)
            success_rate = 1.0  # Assume success if order was completed
            if order.status == 'cancelled':
                success_rate = 0.0
            
            # Create pricing history record
            PricingHistory.objects.create(
                service=service,
                area=area,
                base_price=order_item.unit_price,
                final_price=order_item.total_price,
                factors={
                    'order_volume': order_item.quantity,
                    'customer_segment': 'regular',
                    'season': 'normal'
                },
                customer_segment='regular',
                order_volume=order_item.quantity,
                success_rate=success_rate,
                complexity_score=self._calculate_complexity_score(service)
            )
            
        except Exception as e:
            logger.error(f"Error updating pricing history: {str(e)}")
    
    def _calculate_complexity_score(self, service: Service) -> float:
        """Calculate complexity score for a service"""
        difficulty_scores = {
            'basic': 1.0,
            'intermediate': 2.0,
            'advanced': 3.0,
            'expert': 4.0
        }
        
        base_score = difficulty_scores.get(service.difficulty_level, 1.0)
        
        # Adjust based on estimated days
        if service.estimated_days > 7:
            base_score += 0.5
        elif service.estimated_days > 14:
            base_score += 1.0
        
        return min(base_score, 5.0)
