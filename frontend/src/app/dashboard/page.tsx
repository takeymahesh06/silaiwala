'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Scissors, 
  Calendar, 
  Package, 
  TrendingUp, 
  Star, 
  Clock, 
  CheckCircle,
  UserCheck,
  Settings,
  LogOut,
  Bell,
  Ruler
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'tailor' | 'customer';
  is_verified: boolean;
}

interface DashboardStats {
  total_users?: number;
  total_customers?: number;
  total_tailors?: number;
  total_staff?: number;
  verified_users?: number;
  active_users?: number;
  total_orders?: number;
  rating?: number;
  experience_years?: number;
  hourly_rate?: number;
  is_available?: boolean;
  total_spent?: number;
  loyalty_points?: number;
  preferred_contact_method?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  // const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;

  const getMockStats = useCallback((): DashboardStats => {
    if (user?.role === 'admin') {
      return {
        total_users: 25,
        total_customers: 15,
        total_tailors: 6,
        total_staff: 4,
        verified_users: 20,
        active_users: 22
      };
    } else if (user?.role === 'staff') {
      return {
        total_customers: 15,
        total_tailors: 6,
        verified_users: 5,
        active_users: 4
      };
    } else if (user?.role === 'tailor') {
      return {
        total_orders: 45,
        rating: 4.8,
        experience_years: 5,
        hourly_rate: 500
      };
    } else {
      return {
        total_spent: 2500,
        loyalty_points: 150,
        preferred_contact_method: 'phone'
      };
    }
  }, [user?.role]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/dashboard/stats/`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback to mock data
        setStats(getMockStats());
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(getMockStats());
    } finally {
      setLoading(false);
    }
  }, [API_URL, getMockStats]);

  useEffect(() => {
    // Get user from localStorage (set by AuthGuard or login)
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/auth/login');
        return;
      }
    } else {
      // No user data, redirect to login
      router.push('/auth/login');
      return;
    }
    
    // Fetch dashboard stats
    fetchDashboardStats();
  }, [fetchDashboardStats, router]);


  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Redirect to home page
    router.push('/');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'tailor': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Settings;
      case 'staff': return Users;
      case 'tailor': return Scissors;
      case 'customer': return UserCheck;
      default: return Users;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary btn-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                <RoleIcon className="h-4 w-4 inline mr-1" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.role === 'admin' && (
            <>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_customers}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Scissors className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tailors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_tailors}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Staff</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_staff}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === 'staff' && (
            <>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_customers}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Scissors className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tailors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_tailors}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Verified Tailors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.verified_users}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_users}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === 'tailor' && (
            <>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Experience</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.experience_years} years</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.hourly_rate}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === 'customer' && (
            <>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.total_spent}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Loyalty Points</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.loyalty_points}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-white p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Bell className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Contact Method</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">{stats.preferred_contact_method}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {user.role === 'admin' && (
                <>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-3" />
                      <span>Manage Users</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-gray-600 mr-3" />
                      <span>System Settings</span>
                    </div>
                  </button>
                </>
              )}
              
              {user.role === 'staff' && (
                <>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                      <span>Manage Appointments</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-green-600 mr-3" />
                      <span>Process Orders</span>
                    </div>
                  </button>
                </>
              )}
              
              {user.role === 'tailor' && (
                <>
                  <button 
                    onClick={() => router.push('/tailor/orders')}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-blue-600 mr-3" />
                      <span>View My Orders</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => router.push('/tailor/measurements')}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 text-green-600 mr-3" />
                      <span>Update Measurements</span>
                    </div>
                  </button>
                </>
              )}
              
              {user.role === 'customer' && (
                <>
                  <button 
                    onClick={() => router.push('/book')}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                      <span>Book Appointment</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => router.push('/track')}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-green-600 mr-3" />
                      <span>Track Orders</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">System updated successfully</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">New appointment scheduled</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Order status updated</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
