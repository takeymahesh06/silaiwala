from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet, AppointmentViewSet, MeasurementViewSet,
    TailorViewSet
)

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'measurements', MeasurementViewSet)
router.register(r'tailors', TailorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
