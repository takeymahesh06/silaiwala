from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Avg
from datetime import datetime, timedelta
import random

from services.models import Service, PricingArea
from orders.models import Order, OrderItem
from appointments.models import Customer
from ai_pricing.models import (
    PricingFactor, PricingRule, PricingHistory, 
    CustomerPricingProfile
)


class Command(BaseCommand):
    help = 'Populate initial AI pricing data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-factors',
            action='store_true',
            help='Create pricing factors',
        )
        parser.add_argument(
            '--create-rules',
            action='store_true',
            help='Create pricing rules',
        )
        parser.add_argument(
            '--create-history',
            action='store_true',
            help='Create sample pricing history',
        )
        parser.add_argument(
            '--create-profiles',
            action='store_true',
            help='Create customer pricing profiles',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Create all sample data',
        )

    def handle(self, *args, **options):
        if options['all']:
            self.create_pricing_factors()
            self.create_pricing_rules()
            self.create_pricing_history()
            self.create_customer_profiles()
        else:
            if options['create_factors']:
                self.create_pricing_factors()
            if options['create_rules']:
                self.create_pricing_rules()
            if options['create_history']:
                self.create_pricing_history()
            if options['create_profiles']:
                self.create_customer_profiles()

        self.stdout.write(
            self.style.SUCCESS('Successfully populated AI pricing data')
        )

    def create_pricing_factors(self):
        """Create comprehensive pricing factors for tailoring services"""
        self.stdout.write('Creating pricing factors...')
        
        factors_data = [
            {
                'name': 'Seasonal Demand',
                'factor_type': 'seasonal',
                'weight': 0.15,
                'multiplier_range_min': 0.8,
                'multiplier_range_max': 1.5
            },
            {
                'name': 'Fabric Type Complexity',
                'factor_type': 'fabric_complexity',
                'weight': 0.20,
                'multiplier_range_min': 0.9,
                'multiplier_range_max': 1.3
            },
            {
                'name': 'Garment Length',
                'factor_type': 'garment_length',
                'weight': 0.10,
                'multiplier_range_min': 1.0,
                'multiplier_range_max': 1.2
            },
            {
                'name': 'Design Complexity',
                'factor_type': 'design_complexity',
                'weight': 0.15,
                'multiplier_range_min': 1.0,
                'multiplier_range_max': 1.5
            },
            {
                'name': 'Lining Required',
                'factor_type': 'lining',
                'weight': 0.10,
                'multiplier_range_min': 1.0,
                'multiplier_range_max': 1.3
            },
            {
                'name': 'Handwork/Embroidery',
                'factor_type': 'handwork',
                'weight': 0.15,
                'multiplier_range_min': 1.0,
                'multiplier_range_max': 1.4
            },
            {
                'name': 'Trims & Accessories',
                'factor_type': 'trims',
                'weight': 0.05,
                'multiplier_range_min': 1.0,
                'multiplier_range_max': 1.2
            },
            {
                'name': 'Fit Adjustments',
                'factor_type': 'alterations',
                'weight': 0.10,
                'multiplier_range_min': 1.0,
                'multiplier_range_max': 1.5
            },
            {
                'name': 'Customer Loyalty',
                'factor_type': 'customer_loyalty',
                'weight': 0.15,
                'multiplier_range_min': 0.85,
                'multiplier_range_max': 1.0
            },
            {
                'name': 'Urgency Level',
                'factor_type': 'urgency',
                'weight': 0.10,
                'multiplier_range_min': 1.0,
                'multiplier_range_max': 2.0
            }
        ]
        
        for factor_data in factors_data:
            factor, created = PricingFactor.objects.get_or_create(
                name=factor_data['name'],
                defaults=factor_data
            )
            if created:
                self.stdout.write(f'Created factor: {factor.name}')
            else:
                self.stdout.write(f'Factor already exists: {factor.name}')

    def create_pricing_rules(self):
        """Create comprehensive pricing rules for tailoring services"""
        self.stdout.write('Creating pricing rules...')
        
        rules_data = [
            {
                'name': 'Peak Season Pricing',
                'rule_type': 'if_then',
                'condition': {
                    'field': 'is_peak_season',
                    'operator': 'equals',
                    'value': True
                },
                'action': {
                    'type': 'multiply',
                    'value': 1.3
                },
                'priority': 10
            },
            {
                'name': 'Bulk Order Discount',
                'rule_type': 'threshold',
                'condition': {
                    'field': 'order_volume',
                    'operator': 'greater_than',
                    'value': 5
                },
                'action': {
                    'type': 'multiply',
                    'value': 0.9
                },
                'priority': 8
            },
            {
                'name': 'Silk Fabric Premium',
                'rule_type': 'if_then',
                'condition': {
                    'field': 'fabric_type',
                    'operator': 'equals',
                    'value': 'silk'
                },
                'action': {
                    'type': 'multiply',
                    'value': 1.3
                },
                'priority': 7
            },
            {
                'name': 'Heavy Embroidery Premium',
                'rule_type': 'if_then',
                'condition': {
                    'field': 'handwork_level',
                    'operator': 'equals',
                    'value': 'heavy'
                },
                'action': {
                    'type': 'multiply',
                    'value': 1.4
                },
                'priority': 6
            },
            {
                'name': 'Full Lining Premium',
                'rule_type': 'if_then',
                'condition': {
                    'field': 'lining_type',
                    'operator': 'equals',
                    'value': 'full'
                },
                'action': {
                    'type': 'multiply',
                    'value': 1.2
                },
                'priority': 5
            },
            {
                'name': 'Complex Design Premium',
                'rule_type': 'if_then',
                'condition': {
                    'field': 'design_complexity',
                    'operator': 'equals',
                    'value': 'complex'
                },
                'action': {
                    'type': 'multiply',
                    'value': 1.5
                },
                'priority': 4
            },
            {
                'name': 'VIP Customer Discount',
                'rule_type': 'if_then',
                'condition': {
                    'field': 'customer_loyalty_tier',
                    'operator': 'equals',
                    'value': 'vip'
                },
                'action': {
                    'type': 'multiply',
                    'value': 0.85
                },
                'priority': 9
            },
            {
                'name': 'Rush Delivery Premium',
                'rule_type': 'if_then',
                'condition': {
                    'field': 'urgency_level',
                    'operator': 'equals',
                    'value': 'rush'
                },
                'action': {
                    'type': 'multiply',
                    'value': 2.0
                },
                'priority': 3
            }
        ]
        
        for rule_data in rules_data:
            rule, created = PricingRule.objects.get_or_create(
                name=rule_data['name'],
                defaults=rule_data
            )
            if created:
                self.stdout.write(f'Created rule: {rule.name}')
            else:
                self.stdout.write(f'Rule already exists: {rule.name}')

    def create_pricing_history(self):
        """Create sample pricing history"""
        self.stdout.write('Creating pricing history...')
        
        services = Service.objects.all()
        areas = PricingArea.objects.all()
        
        if not services.exists() or not areas.exists():
            self.stdout.write('No services or areas found. Please create them first.')
            return
        
        # Create sample pricing history
        for i in range(50):  # Create 50 sample records
            service = random.choice(services)
            area = random.choice(areas)
            
            # Get base pricing
            try:
                from services.models import ServicePricing
                base_pricing = ServicePricing.objects.get(service=service, area=area)
                base_price = float(base_pricing.base_price)
            except:
                base_price = random.uniform(500, 5000)
            
            # Calculate final price with some variation
            multiplier = random.uniform(0.8, 1.5)
            final_price = base_price * multiplier
            
            # Create pricing history record
            PricingHistory.objects.get_or_create(
                service=service,
                area=area,
                base_price=base_price,
                final_price=final_price,
                defaults={
                    'factors': {
                        'order_volume': random.randint(1, 10),
                        'season': random.choice(['normal', 'peak', 'low']),
                        'customer_segment': random.choice(['new', 'regular', 'vip'])
                    },
                    'order_volume': random.randint(1, 10),
                    'success_rate': random.uniform(0.7, 1.0),
                    'complexity_score': random.uniform(1.0, 5.0),
                    'season': random.choice(['normal', 'peak', 'low']),
                    'customer_segment': random.choice(['new', 'regular', 'vip']),
                    'fabric_cost': random.uniform(100, 1000),
                    'created_at': timezone.now() - timedelta(days=random.randint(1, 365))
                }
            )
        
        self.stdout.write('Created 50 pricing history records')

    def create_customer_profiles(self):
        """Create customer pricing profiles"""
        self.stdout.write('Creating customer pricing profiles...')
        
        customers = Customer.objects.all()
        
        if not customers.exists():
            self.stdout.write('No customers found. Please create them first.')
            return
        
        for customer in customers:
            # Calculate customer metrics
            orders = Order.objects.filter(customer=customer)
            total_orders = orders.count()
            avg_order_value = orders.aggregate(avg=Avg('total_amount'))['avg'] or 0
            
            # Determine loyalty tier
            if total_orders >= 20:
                loyalty_tier = 'vip'
                discount_percentage = 15
            elif total_orders >= 10:
                loyalty_tier = 'regular'
                discount_percentage = 5
            else:
                loyalty_tier = 'new'
                discount_percentage = 0
            
            # Create or update customer profile
            profile, created = CustomerPricingProfile.objects.get_or_create(
                customer=customer,
                defaults={
                    'loyalty_tier': loyalty_tier,
                    'discount_percentage': discount_percentage,
                    'total_orders': total_orders,
                    'average_order_value': avg_order_value,
                    'payment_reliability_score': random.uniform(0.8, 1.0)
                }
            )
            
            if created:
                self.stdout.write(f'Created profile for: {customer.name}')
            else:
                self.stdout.write(f'Profile already exists for: {customer.name}')
