from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, UserLoginView, UserLogoutView,
    UserViewSet, TailorProfileViewSet, StaffProfileViewSet,
    CustomerProfileViewSet, DashboardStatsView
)
from .otp_views import (
    send_otp, verify_otp, register_with_otp, resend_otp, check_phone_exists
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'tailor-profiles', TailorProfileViewSet)
router.register(r'staff-profiles', StaffProfileViewSet)
router.register(r'customer-profiles', CustomerProfileViewSet)

urlpatterns = [
    # Traditional authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', UserLogoutView.as_view(), name='user-logout'),
    
    # OTP authentication endpoints
    path('auth/otp/send/', send_otp, name='send-otp'),
    path('auth/otp/verify/', verify_otp, name='verify-otp'),
    path('auth/otp/register/', register_with_otp, name='register-with-otp'),
    path('auth/otp/resend/', resend_otp, name='resend-otp'),
    path('auth/check-phone/', check_phone_exists, name='check-phone-exists'),
    
    # Dashboard stats
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Include router URLs
    path('', include(router.urls)),
]
