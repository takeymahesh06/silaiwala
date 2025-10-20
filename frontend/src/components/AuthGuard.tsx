'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Shield } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'tailor' | 'customer';
  fallbackUrl?: string;
}

export default function AuthGuard({ 
  children, 
  requiredRole, 
  fallbackUrl = '/' 
}: AuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is logged in
      const authToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');

      if (!authToken || !userData) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);

      // Verify token with backend
      const response = await fetch('http://localhost:8000/api/users/users/me/', {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token is invalid, clear storage and redirect
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      const currentUser = await response.json();
      setUser(currentUser);

      // Check role requirements
      if (requiredRole && currentUser.role !== requiredRole) {
        setError(`Access denied. ${requiredRole} role required.`);
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleGoHome = () => {
    router.push(fallbackUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            {error.includes('Access denied') ? (
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error.includes('Access denied') ? 'Access Denied' : 'Authentication Required'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            {!error.includes('Access denied') && (
              <button
                onClick={handleLogin}
                className="w-full btn btn-primary btn-lg"
              >
                Login
              </button>
            )}
            
            <button
              onClick={handleGoHome}
              className="w-full btn btn-outline btn-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
