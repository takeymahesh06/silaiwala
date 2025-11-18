'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface RegisterFormData {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'customer' | 'tailor';
  otp_code: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');
  const [formData, setRegisterFormData] = useState<RegisterFormData>({
    phone_number: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'customer',
    otp_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/users/auth/otp/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          otp_type: 'register'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        setSuccess('OTP sent successfully!');
        setCountdown(60); // 60 seconds countdown
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Log OTP for development (remove in production)
        console.log('OTP Code:', data.otp_code);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Failed to send OTP:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      const data = await response.json();

      if (response.ok) {
        // Now register the user
        const registerResponse = await apiRequest('/api/users/auth/otp/register/', {
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

        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
          // Store auth token
          localStorage.setItem('auth_token', registerData.token);
          localStorage.setItem('user', JSON.stringify(registerData.user));
          
          setStep('success');
          setSuccess('Registration successful!');
          
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setError(registerData.error || 'Registration failed');
        }
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');

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

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP sent successfully!');
        setCountdown(60);
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Log OTP for development (remove in production)
        console.log('OTP Code:', data.otp_code);
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-green-600 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to SilaiWala! Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-full">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 'details' ? 'Create your account' : 'Verify your phone'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'details' 
            ? 'Join SilaiWala and get started' 
            : `OTP sent to ${formData.phone_number}`
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
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
                      className="input w-full"
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
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

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
                    placeholder="+91 98765 43210"
                    className="input w-full"
                  />
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
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I am a
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    <option value="customer">Customer</option>
                    <option value="tailor">Tailor</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
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
                    placeholder="123456"
                    className="input w-full text-center text-2xl tracking-widest"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="btn btn-outline btn-md flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-md flex-1"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                >
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Resend in {countdown}s
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Resend OTP
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push('/auth/login')}
                className="btn btn-outline btn-md w-full"
              >
                Sign in instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
