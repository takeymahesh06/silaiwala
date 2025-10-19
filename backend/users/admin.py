from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, TailorProfile, StaffProfile, CustomerProfile, Permission, RolePermission
from .otp_models import OTP, PhoneVerification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'is_active', 'created_at')
    list_filter = ('role', 'is_verified', 'is_active', 'is_superuser', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone', 'address')}),
        ('Role & Permissions', {'fields': ('role', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('created_at', 'last_login')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(TailorProfile)
class TailorProfileAdmin(admin.ModelAdmin):
    """Admin configuration for TailorProfile model"""
    list_display = ('user', 'expertise_level', 'experience_years', 'rating', 'total_orders', 'is_available', 'hourly_rate')
    list_filter = ('expertise_level', 'is_available', 'specializations')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    ordering = ('-rating', '-total_orders')
    
    fieldsets = (
        ('Basic Info', {'fields': ('user', 'expertise_level', 'experience_years', 'bio')}),
        ('Performance', {'fields': ('rating', 'total_orders', 'total_earnings')}),
        ('Availability & Pricing', {'fields': ('is_available', 'hourly_rate')}),
        ('Specializations', {'fields': ('specializations',)}),
    )
    
    readonly_fields = ('rating', 'total_orders')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    """Admin configuration for StaffProfile model"""
    list_display = ('user', 'employee_id', 'department', 'hire_date', 'salary', 'is_active', 'manager')
    list_filter = ('department', 'is_active', 'hire_date')
    search_fields = ('user__username', 'user__email', 'employee_id', 'user__first_name', 'user__last_name')
    ordering = ('-hire_date',)
    
    fieldsets = (
        ('Basic Info', {'fields': ('user', 'employee_id', 'department')}),
        ('Employment', {'fields': ('hire_date', 'salary', 'manager', 'is_active')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'manager')


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    """Admin configuration for CustomerProfile model"""
    list_display = ('user', 'total_orders', 'total_spent', 'loyalty_points', 'preferred_contact_method', 'preferred_tailor')
    list_filter = ('preferred_contact_method', 'preferred_tailor')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'user__phone')
    ordering = ('-total_orders', '-total_spent')
    
    fieldsets = (
        ('Basic Info', {'fields': ('user', 'preferred_contact_method', 'preferred_tailor')}),
        ('Order History', {'fields': ('total_orders', 'total_spent', 'loyalty_points')}),
        ('Preferences', {'fields': ('notes',)}),
    )
    
    readonly_fields = ('total_orders', 'total_spent', 'loyalty_points')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'preferred_tailor')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """Admin configuration for Permission model"""
    list_display = ('name', 'codename', 'description')
    search_fields = ('name', 'codename', 'description')
    ordering = ('name',)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    """Admin configuration for RolePermission model"""
    list_display = ('role', 'permission')
    list_filter = ('role', 'permission')
    search_fields = ('role', 'permission__name')
    ordering = ('role', 'permission__name')


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    """Admin configuration for OTP model"""
    list_display = ('phone_number', 'otp_type', 'is_verified', 'attempts', 'created_at', 'expires_at')
    list_filter = ('otp_type', 'is_verified', 'created_at')
    search_fields = ('phone_number', 'otp_code')
    ordering = ('-created_at',)
    readonly_fields = ('otp_code', 'created_at', 'expires_at', 'verified_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(PhoneVerification)
class PhoneVerificationAdmin(admin.ModelAdmin):
    """Admin configuration for PhoneVerification model"""
    list_display = ('phone_number', 'is_verified', 'verified_at', 'user', 'created_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('phone_number', 'user__username', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')