'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, ArrowRight, Loader2, AlertCircle, Shield } from 'lucide-react';

interface LoginFormData {
  username: string;
  password: string;
}

export default function AdminLoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/users/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is admin or superuser
        if (data.user.role === 'admin' || data.user.is_superuser) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/admin');
        } else {
          setError('Access denied. Admin privileges required.');
        }
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the SilaiWala admin portal
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <AlertCircle className="inline h-5 w-5 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="input pl-10"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input pl-10"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
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
              Login to Admin Portal
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              ← Back to regular login
            </Link>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Demo Credentials:</h3>
          <div className="text-sm text-yellow-700">
            <p><strong>Username:</strong> superadmin</p>
            <p><strong>Password:</strong> superadmin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
