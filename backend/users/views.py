from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import User, TailorProfile, StaffProfile, CustomerProfile, Permission, RolePermission
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer, 
    UserProfileSerializer, TailorProfileSerializer, StaffProfileSerializer,
    CustomerProfileSerializer, UserUpdateSerializer, TailorProfileUpdateSerializer,
    StaffProfileUpdateSerializer, CustomerProfileUpdateSerializer
)


class UserRegistrationView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create profile based on role
            if user.role == 'tailor':
                TailorProfile.objects.create(user=user)
            elif user.role == 'staff':
                StaffProfile.objects.create(user=user)
            elif user.role == 'customer':
                CustomerProfile.objects.create(user=user)
            
            # Create auth token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            
            # Create or get auth token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Delete the token
            request.user.auth_token.delete()
        except:
            pass
        
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['date_joined', 'last_login', 'username']
    ordering = ['-date_joined']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'list']:
            permission_classes = [permissions.IsAdminUser]
        elif self.action in ['retrieve', 'update', 'partial_update', 'me', 'update_profile']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.is_admin:
            return User.objects.all()
        elif user.is_staff:
            # Staff can see customers and tailors
            return User.objects.filter(role__in=['customer', 'tailor'])
        else:
            # Users can only see their own profile
            return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def verify_user(self, request, pk=None):
        """Verify a user (admin only)"""
        if not request.user.is_admin:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        user.is_verified = True
        user.save()
        
        return Response({'message': 'User verified successfully'})
    
    @action(detail=True, methods=['post'])
    def deactivate_user(self, request, pk=None):
        """Deactivate a user (admin only)"""
        if not request.user.is_admin:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return Response({'message': 'User deactivated successfully'})


class TailorProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for tailor profiles"""
    queryset = TailorProfile.objects.all()
    serializer_class = TailorProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['expertise_level', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['rating', 'total_orders', 'experience_years']
    ordering = ['-rating']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current tailor's profile"""
        if not request.user.is_tailor:
            return Response({'error': 'Not a tailor'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.tailor_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except TailorProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_my_profile(self, request):
        """Update current tailor's profile"""
        if not request.user.is_tailor:
            return Response({'error': 'Not a tailor'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.tailor_profile
            serializer = TailorProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TailorProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


class StaffProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for staff profiles"""
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id']
    ordering_fields = ['hire_date', 'user__date_joined']
    ordering = ['-hire_date']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current staff's profile"""
        if not request.user.is_staff:
            return Response({'error': 'Not a staff member'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.staff_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except StaffProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


class CustomerProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for customer profiles"""
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['preferred_contact_method']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'user__phone']
    ordering_fields = ['total_orders', 'total_spent', 'loyalty_points']
    ordering = ['-total_orders']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.is_admin or user.is_staff:
            return CustomerProfile.objects.all()
        else:
            # Customers can only see their own profile
            return CustomerProfile.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current customer's profile"""
        if not request.user.is_customer:
            return Response({'error': 'Not a customer'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.customer_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except CustomerProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_my_profile(self, request):
        """Update current customer's profile"""
        if not request.user.is_customer:
            return Response({'error': 'Not a customer'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.customer_profile
            serializer = CustomerProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except CustomerProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


class DashboardStatsView(APIView):
    """Get dashboard statistics based on user role"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        stats = {}
        
        if user.is_admin:
            stats = {
                'total_users': User.objects.count(),
                'total_customers': User.objects.filter(role='customer').count(),
                'total_tailors': User.objects.filter(role='tailor').count(),
                'total_staff': User.objects.filter(role='staff').count(),
                'verified_users': User.objects.filter(is_verified=True).count(),
                'active_users': User.objects.filter(is_active=True).count(),
            }
        elif user.is_staff:
            stats = {
                'total_customers': User.objects.filter(role='customer').count(),
                'total_tailors': User.objects.filter(role='tailor').count(),
                'verified_tailors': User.objects.filter(role='tailor', is_verified=True).count(),
                'available_tailors': TailorProfile.objects.filter(is_available=True).count(),
            }
        elif user.is_tailor:
            try:
                profile = user.tailor_profile
                stats = {
                    'total_orders': profile.total_orders,
                    'rating': float(profile.rating),
                    'experience_years': profile.experience_years,
                    'hourly_rate': float(profile.hourly_rate),
                    'is_available': profile.is_available,
                }
            except TailorProfile.DoesNotExist:
                stats = {'error': 'Profile not found'}
        elif user.is_customer:
            try:
                profile = user.customer_profile
                stats = {
                    'total_orders': profile.total_orders,
                    'total_spent': float(profile.total_spent),
                    'loyalty_points': profile.loyalty_points,
                    'preferred_contact_method': profile.preferred_contact_method,
                }
            except CustomerProfile.DoesNotExist:
                stats = {'error': 'Profile not found'}
        
        return Response(stats)