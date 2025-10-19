'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Package, 
  Settings, 
  Scissors,
  User,
  Briefcase,
  Crown,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_customers: number;
  total_tailors: number;
  total_staff: number;
  total_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  total_orders: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_customers: 0,
    total_tailors: 0,
    total_staff: 0,
    total_appointments: 0,
    pending_appointments: 0,
    completed_appointments: 0,
    total_orders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch user stats
      const userResponse = await fetch('http://localhost:8000/api/users/dashboard/stats/');
      const userData = userResponse.ok ? await userResponse.json() : {};
      
      // Fetch appointment stats
      const appointmentResponse = await fetch('http://localhost:8000/api/appointments/appointments/');
      const appointmentData = appointmentResponse.ok ? await appointmentResponse.json() : { results: [] };
      
      // Mock additional stats
      const mockStats = {
        total_appointments: appointmentData.results?.length || 0,
        pending_appointments: appointmentData.results?.filter((a: any) => a.status === 'pending').length || 0,
        completed_appointments: appointmentData.results?.filter((a: any) => a.status === 'completed').length || 0,
        total_orders: 45,
        revenue: 125000
      };
      
      setStats({ ...userData, ...mockStats });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        total_users: 25,
        total_customers: 15,
        total_tailors: 6,
        total_staff: 4,
        total_appointments: 12,
        pending_appointments: 3,
        completed_appointments: 8,
        total_orders: 45,
        revenue: 125000
      });
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'blue',
      href: '/admin/users',
      stats: stats.total_users
    },
    {
      title: 'Appointments',
      description: 'View and manage appointments',
      icon: Calendar,
      color: 'green',
      href: '/admin',
      stats: stats.total_appointments
    },
    {
      title: 'Orders',
      description: 'Track and manage orders',
      icon: Package,
      color: 'purple',
      href: '/admin/orders',
      stats: stats.total_orders
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: 'gray',
      href: '/admin/settings',
      stats: null
    }
  ];

  const quickStats = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Tailors',
      value: stats.total_tailors,
      icon: Scissors,
      color: 'green',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Pending Appointments',
      value: stats.pending_appointments,
      icon: Calendar,
      color: 'yellow',
      change: '-2%',
      changeType: 'negative'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'purple',
      change: '+18%',
      changeType: 'positive'
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(section.href)}
                className="card bg-white p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-${section.color}-100`}>
                    <Icon className={`h-6 w-6 text-${section.color}-600`} />
                  </div>
                  {section.stats !== null && (
                    <span className="text-2xl font-bold text-gray-900">{section.stats}</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            );
          })}
        </div>

        {/* User Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 mr-3">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Customers</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.total_customers}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-3">
                    <Scissors className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Tailors</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.total_tailors}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Staff</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.total_staff}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 mr-3">
                    <Crown className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Admins</span>
                </div>
                <span className="text-sm font-bold text-gray-900">1</span>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 mr-3">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New customer registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Appointment completed</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100 mr-3">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New order placed</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 mr-3">
                  <Scissors className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Tailor profile updated</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
