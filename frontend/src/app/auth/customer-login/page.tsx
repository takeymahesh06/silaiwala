'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ArrowRight, Loader2, AlertCircle, User } from 'lucide-react';

export default function CustomerLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/users/auth/otp/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber, otp_type: 'login' }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setMessage(data.message || 'OTP sent to your phone number.');
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/users/auth/otp/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber, otp_code: otpCode, otp_type: 'login' }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is a customer
        if (data.user.role !== 'customer') {
          setError('This login is only for customers. Please use the appropriate login page.');
          return;
        }
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Login successful! Redirecting...');
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to verify OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {otpSent ? 'Verify OTP' : 'Customer Login'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {!otpSent ? 'Login to your customer account' : 'Enter the OTP sent to your phone'}
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Or{' '}
            <Link href="/auth/tailor-login" className="font-medium text-blue-600 hover:text-blue-500">
              login as a tailor
            </Link>
            {' '}or{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <AlertCircle className="inline h-5 w-5 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {!otpSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="phone-number" className="sr-only">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone-number"
                    name="phone-number"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="input pl-10"
                    placeholder="Phone Number (e.g., +919876543210)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-5 w-5 mr-2" />
                )}
                Send OTP
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="otp-code" className="sr-only">
                  OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp-code"
                    name="otp-code"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    className="input pl-10"
                    placeholder="Enter OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-5 w-5 mr-2" />
                )}
                Verify OTP & Login
              </button>
            </div>
            <div className="text-sm text-center">
              <button
                type="button"
                onClick={handleSendOtp}
                className="font-medium text-blue-600 hover:text-blue-500"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
