from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceCategoryViewSet, ServiceViewSet, PricingAreaViewSet,
    ServicePricingViewSet, ServiceRequirementViewSet
)

router = DefaultRouter()
router.register(r'categories', ServiceCategoryViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'areas', PricingAreaViewSet)
router.register(r'pricing', ServicePricingViewSet)
router.register(r'requirements', ServiceRequirementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
