from django.urls import path
from . import views

app_name = 'ai_pricing'

urlpatterns = [
    # Pricing calculation endpoints
    path('calculate-price/', views.calculate_dynamic_price, name='calculate_dynamic_price'),
    path('service/<int:service_id>/pricing/', views.get_service_pricing, name='get_service_pricing'),
    path('service/<int:service_id>/recommendations/', views.get_pricing_recommendations, name='get_pricing_recommendations'),
    
    # ML model endpoints
    path('train-model/', views.train_pricing_model, name='train_pricing_model'),
    
    # Data endpoints
    path('factors/', views.get_pricing_factors, name='get_pricing_factors'),
    path('history/', views.get_pricing_history, name='get_pricing_history'),
    path('analytics/', views.get_pricing_analytics, name='get_pricing_analytics'),
    
    # Customer endpoints
    path('customer/<int:customer_id>/profile/', views.get_customer_pricing_profile, name='get_customer_pricing_profile'),
    
    # Order integration endpoints
    path('update-history/', views.update_pricing_history_from_order, name='update_pricing_history_from_order'),
]
