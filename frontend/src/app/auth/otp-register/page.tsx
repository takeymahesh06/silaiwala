'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface OTPResponse {
  message: string;
  phone_number: string;
  expires_in: number;
  otp_code?: string; // For development only
  error?: string;
}

interface VerifyResponse {
  message: string;
  phone_number: string;
  verified: boolean;
  error?: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_verified: boolean;
  };
  token: string;
  error?: string;
}

export default function OTPRegister() {
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [formData, setFormData] = useState({
    phone_number: '',
    otp_code: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Add +91 if it's a 10-digit Indian number
    if (cleaned.length === 10) {
      return '+91' + cleaned;
    }
    
    // Return as is if it already has country code
    return '+' + cleaned;
  };

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formattedPhone = formatPhoneNumber(formData.phone_number);
      
      const response = await apiRequest('/api/users/auth/otp/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          otp_type: 'register'
        }),
      });

      const data: OTPResponse = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setCountdown(60); // 60 seconds countdown
        setStep('otp');
        setFormData(prev => ({ ...prev, phone_number: formattedPhone }));
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiRequest('/api/users/auth/otp/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          otp_code: formData.otp_code,
          otp_type: 'register'
        }),
      });

      const data: VerifyResponse = await response.json();

      if (response.ok) {
        setSuccess('Phone number verified! Please complete your profile.');
        setStep('details');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiRequest('/api/users/auth/otp/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role: formData.role
        }),
      });

      const data: RegisterResponse = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess('Registration successful! Redirecting...');
        
        // Redirect based on user role
        setTimeout(() => {
          if (data.user?.role === 'admin') {
            router.push('/admin');
          } else if (data.user?.role === 'tailor') {
            router.push('/tailor/dashboard');
          } else {
            router.push('/dashboard');
          }
        }, 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiRequest('/api/users/auth/otp/resend/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          otp_type: 'register'
        }),
      });

      const data: OTPResponse = await response.json();

      if (response.ok) {
        setSuccess('OTP sent successfully!');
        setCountdown(60);
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'phone') {
      sendOTP();
    } else if (step === 'otp') {
      verifyOTP();
    } else {
      completeRegistration();
    }
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('phone');
    } else if (step === 'details') {
      setStep('otp');
    }
    setError('');
    setSuccess('');
    setCountdown(0);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'phone': return 'Create Account';
      case 'otp': return 'Verify Phone';
      case 'details': return 'Complete Profile';
      default: return 'Create Account';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'phone': return 'Enter your phone number to get started';
      case 'otp': return `Enter the OTP sent to ${formData.phone_number}`;
      case 'details': return 'Complete your profile information';
      default: return 'Enter your phone number to get started';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <Smartphone className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {getStepTitle()}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {getStepDescription()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step !== 'phone' && (
            <button
              onClick={goBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {step === 'phone' && (
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  We&apos;ll send a 6-digit OTP to verify this number
                </p>
              </div>
            )}

            {step === 'otp' && (
              <div>
                <label htmlFor="otp_code" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="mt-1">
                  <input
                    id="otp_code"
                    name="otp_code"
                    type="text"
                    required
                    maxLength={6}
                    value={formData.otp_code}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {countdown > 0 ? `${countdown}s` : 'OTP expired'}
                  </div>
                  
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={countdown > 0 || loading}
                    className="text-sm text-green-600 hover:text-green-500 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="customer">Customer</option>
                      <option value="tailor">Tailor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {step === 'phone' ? 'Sending OTP...' : step === 'otp' ? 'Verifying...' : 'Creating Account...'}
                  </div>
                ) : (
                  step === 'phone' ? 'Send OTP' : step === 'otp' ? 'Verify OTP' : 'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/auth/otp-login" className="font-medium text-green-600 hover:text-green-500">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
