from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .otp_models import OTP, PhoneVerification
from .serializers import UserSerializer
import re

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send OTP to phone number for login/registration"""
    phone_number = request.data.get('phone_number')
    otp_type = request.data.get('otp_type', 'login')
    
    if not phone_number:
        return Response(
            {'error': 'Phone number is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate phone number format (allow spaces and dashes)
    clean_phone = re.sub(r'[\s\-]', '', phone_number)
    if not re.match(r'^\+?1?\d{9,15}$', clean_phone):
        return Response(
            {'error': 'Invalid phone number format'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Use cleaned phone number
    phone_number = clean_phone
    
    # Check if user exists for login
    if otp_type == 'login':
        try:
            user = User.objects.get(phone=phone_number)
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this phone number'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        # For registration, check if phone number already exists
        if User.objects.filter(phone=phone_number).exists():
            return Response(
                {'error': 'Account already exists with this phone number'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user = None
    
    # Generate and send OTP
    try:
        otp = OTP.generate_otp(phone_number, otp_type, user)
        otp.send_otp()
        
        return Response({
            'message': 'OTP sent successfully',
            'phone_number': phone_number,
            'expires_in': 600,  # 10 minutes in seconds
            'otp_code': otp.otp_code  # Remove this in production
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to send OTP'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and authenticate user"""
    phone_number = request.data.get('phone_number')
    otp_code = request.data.get('otp_code')
    otp_type = request.data.get('otp_type', 'login')
    
    if not phone_number or not otp_code:
        return Response(
            {'error': 'Phone number and OTP code are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Clean phone number
    phone_number = re.sub(r'[\s\-]', '', phone_number)
    
    try:
        # Get the latest OTP for this phone number and type
        otp = OTP.objects.filter(
            phone_number=phone_number,
            otp_type=otp_type,
            is_verified=False
        ).order_by('-created_at').first()
        
        if not otp:
            return Response(
                {'error': 'No OTP found for this phone number'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify OTP
        is_valid, message = otp.verify(otp_code)
        
        if not is_valid:
            return Response(
                {'error': message}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle different OTP types
        if otp_type == 'login':
            # Login user
            user = otp.user
            if not user:
                return Response(
                    {'error': 'User not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create or get auth token
            token, created = Token.objects.get_or_create(user=user)
            
            # Mark phone as verified
            PhoneVerification.mark_verified(phone_number, user)
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_200_OK)
        
        elif otp_type == 'register':
            # Registration - return success, user will be created in next step
            return Response({
                'message': 'OTP verified successfully',
                'phone_number': phone_number,
                'verified': True
            }, status=status.HTTP_200_OK)
        
        elif otp_type == 'phone_verification':
            # Phone verification
            user = otp.user
            if user:
                PhoneVerification.mark_verified(phone_number, user)
                user.is_verified = True
                user.save()
            
            return Response({
                'message': 'Phone number verified successfully',
                'verified': True
            }, status=status.HTTP_200_OK)
        
        else:
            return Response(
                {'error': 'Invalid OTP type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'error': 'Failed to verify OTP'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_with_otp(request):
    """Register new user after OTP verification"""
    phone_number = request.data.get('phone_number')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    email = request.data.get('email')
    role = request.data.get('role', 'customer')
    
    if not all([phone_number, first_name, last_name]):
        return Response(
            {'error': 'Phone number, first name, and last name are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate email if provided
    if email:
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {'error': 'Invalid email format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Check if OTP was verified
    try:
        otp = OTP.objects.filter(
            phone_number=phone_number,
            otp_type='register',
            is_verified=True
        ).order_by('-created_at').first()
        
        if not otp:
            return Response(
                {'error': 'Please verify your phone number first'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if OTP is still valid (within 30 minutes)
        if timezone.now() > otp.verified_at + timezone.timedelta(minutes=30):
            return Response(
                {'error': 'OTP verification expired. Please verify again'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
    except Exception:
        return Response(
            {'error': 'Please verify your phone number first'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(phone=phone_number).exists():
        return Response(
            {'error': 'Account already exists with this phone number'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    try:
        user = User.objects.create_user(
            username=phone_number,  # Use phone as username
            phone=phone_number,
            first_name=first_name,
            last_name=last_name,
            email=email or '',
            role=role,
            is_verified=True  # Phone is verified
        )
        
        # Create profile based on role
        if role == 'tailor':
            from .models import TailorProfile
            TailorProfile.objects.create(user=user)
        elif role == 'staff':
            from .models import StaffProfile
            StaffProfile.objects.create(user=user)
        elif role == 'customer':
            from .models import CustomerProfile
            CustomerProfile.objects.create(user=user)
        
        # Mark phone as verified
        PhoneVerification.mark_verified(phone_number, user)
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to create account'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """Resend OTP to phone number"""
    phone_number = request.data.get('phone_number')
    otp_type = request.data.get('otp_type', 'login')
    
    if not phone_number:
        return Response(
            {'error': 'Phone number is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Clean phone number
    phone_number = re.sub(r'[\s\-]', '', phone_number)
    
    # Check if there's a recent OTP (within 1 minute)
    recent_otp = OTP.objects.filter(
        phone_number=phone_number,
        otp_type=otp_type,
        created_at__gte=timezone.now() - timezone.timedelta(minutes=1)
    ).exists()
    
    if recent_otp:
        return Response(
            {'error': 'Please wait before requesting another OTP'}, 
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Get user for login type
    user = None
    if otp_type == 'login':
        try:
            user = User.objects.get(phone=phone_number)
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this phone number'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    try:
        # Generate and send new OTP
        otp = OTP.generate_otp(phone_number, otp_type, user)
        otp.send_otp()
        
        return Response({
            'message': 'OTP sent successfully',
            'phone_number': phone_number,
            'expires_in': 600,  # 10 minutes in seconds
            'otp_code': otp.otp_code  # Remove this in production
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to send OTP'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def check_phone_exists(request):
    """Check if phone number is already registered"""
    phone_number = request.GET.get('phone_number')
    
    if not phone_number:
        return Response(
            {'error': 'Phone number is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Clean phone number
    phone_number = re.sub(r'[\s\-]', '', phone_number)
    
    exists = User.objects.filter(phone=phone_number).exists()
    
    return Response({
        'phone_number': phone_number,
        'exists': exists
    }, status=status.HTTP_200_OK)
