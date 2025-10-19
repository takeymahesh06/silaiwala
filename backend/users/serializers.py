from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, TailorProfile, StaffProfile, CustomerProfile, Permission, RolePermission


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'phone', 'address', 'role', 'password', 'password_confirm')
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'phone', 'address', 'role', 'role_display', 'is_verified', 'date_joined', 'last_login')
        read_only_fields = ('id', 'date_joined', 'last_login')
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class TailorProfileSerializer(serializers.ModelSerializer):
    """Serializer for tailor profile"""
    user = UserSerializer(read_only=True)
    expertise_level_display = serializers.CharField(source='get_expertise_level_display', read_only=True)
    specializations = serializers.StringRelatedField(many=True, read_only=True)
    
    class Meta:
        model = TailorProfile
        fields = '__all__'


class StaffProfileSerializer(serializers.ModelSerializer):
    """Serializer for staff profile"""
    user = UserSerializer(read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    manager_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StaffProfile
        fields = '__all__'
    
    def get_manager_name(self, obj):
        return obj.manager.get_full_name() if obj.manager else None


class CustomerProfileSerializer(serializers.ModelSerializer):
    """Serializer for customer profile"""
    user = UserSerializer(read_only=True)
    preferred_contact_method_display = serializers.CharField(source='get_preferred_contact_method_display', read_only=True)
    preferred_tailor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomerProfile
        fields = '__all__'
    
    def get_preferred_tailor_name(self, obj):
        return obj.preferred_tailor.get_full_name() if obj.preferred_tailor else None


class UserProfileSerializer(serializers.ModelSerializer):
    """Comprehensive user profile serializer"""
    tailor_profile = TailorProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
    customer_profile = CustomerProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'address', 'role', 'is_verified', 'date_joined', 'last_login', 'tailor_profile', 'staff_profile', 'customer_profile')
        read_only_fields = ('id', 'date_joined', 'last_login')


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for permissions"""
    
    class Meta:
        model = Permission
        fields = '__all__'


class RolePermissionSerializer(serializers.ModelSerializer):
    """Serializer for role permissions"""
    permission = PermissionSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = RolePermission
        fields = '__all__'


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone', 'address')
    
    def update(self, instance, validated_data):
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class TailorProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tailor profile"""
    
    class Meta:
        model = TailorProfile
        fields = ('expertise_level', 'experience_years', 'bio', 'hourly_rate', 'is_available', 'specializations')


class StaffProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating staff profile"""
    
    class Meta:
        model = StaffProfile
        fields = ('department', 'employee_id', 'hire_date', 'salary', 'manager', 'is_active')


class CustomerProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating customer profile"""
    
    class Meta:
        model = CustomerProfile
        fields = ('preferred_contact_method', 'preferred_tailor', 'notes')
