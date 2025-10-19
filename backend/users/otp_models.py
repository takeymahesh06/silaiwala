from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import random
import string

User = get_user_model()


class OTP(models.Model):
    """OTP model for phone number verification"""
    
    OTP_TYPE_CHOICES = [
        ('login', 'Login'),
        ('register', 'Registration'),
        ('password_reset', 'Password Reset'),
        ('phone_verification', 'Phone Verification'),
    ]
    
    phone_number = models.CharField(max_length=15)
    otp_code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPE_CHOICES, default='login')
    is_verified = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)
    max_attempts = models.PositiveIntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='otps')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', 'otp_type']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"OTP for {self.phone_number} - {self.otp_type}"
    
    @classmethod
    def generate_otp(cls, phone_number, otp_type='login', user=None):
        """Generate a new OTP for the given phone number"""
        # Delete any existing unverified OTPs for this phone number and type
        cls.objects.filter(
            phone_number=phone_number,
            otp_type=otp_type,
            is_verified=False
        ).delete()
        
        # Generate 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        
        # Create OTP with 10 minutes expiry
        otp = cls.objects.create(
            phone_number=phone_number,
            otp_code=otp_code,
            otp_type=otp_type,
            expires_at=timezone.now() + timezone.timedelta(minutes=10),
            user=user
        )
        
        return otp
    
    def is_expired(self):
        """Check if OTP has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if OTP is valid (not expired, not verified, within attempts)"""
        return (
            not self.is_expired() and
            not self.is_verified and
            self.attempts < self.max_attempts
        )
    
    def verify(self, provided_otp):
        """Verify the provided OTP"""
        if not self.is_valid():
            return False, "OTP is invalid or expired"
        
        if self.otp_code != provided_otp:
            self.attempts += 1
            self.save()
            return False, f"Invalid OTP. {self.max_attempts - self.attempts} attempts remaining"
        
        # OTP is correct
        self.is_verified = True
        self.verified_at = timezone.now()
        self.save()
        return True, "OTP verified successfully"
    
    def send_otp(self):
        """Send OTP via SMS (placeholder - integrate with SMS service)"""
        # In production, integrate with SMS service like Twilio, AWS SNS, etc.
        print(f"Sending OTP {self.otp_code} to {self.phone_number}")
        # For development, we'll just print the OTP
        return True


class PhoneVerification(models.Model):
    """Track phone number verification status"""
    
    phone_number = models.CharField(max_length=15, unique=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='phone_verification')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.phone_number} - {'Verified' if self.is_verified else 'Unverified'}"
    
    @classmethod
    def mark_verified(cls, phone_number, user=None):
        """Mark phone number as verified"""
        verification, created = cls.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                'is_verified': True,
                'verified_at': timezone.now(),
                'user': user
            }
        )
        if not created:
            verification.is_verified = True
            verification.verified_at = timezone.now()
            verification.user = user
            verification.save()
        return verification
