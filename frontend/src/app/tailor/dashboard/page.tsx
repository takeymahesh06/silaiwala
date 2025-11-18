'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Scissors, 
  Calendar, 
  Package, 
  TrendingUp, 
  Star, 
  Clock, 
  CheckCircle,
  User,
  Settings,
  LogOut,
  Award,
  DollarSign,
  Target,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface TailorProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  expertise_level: string;
  experience_years: number;
  bio: string;
  hourly_rate: number;
  is_available: boolean;
  rating: number;
  total_orders: number;
  specializations: Array<{
    id: number;
    name: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  order_number: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  status: string;
  total_amount: number;
  order_date: string;
  expected_delivery_date: string;
  special_instructions: string;
}

interface Appointment {
  id: number;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes: string;
}

interface TailorStats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  in_progress_orders: number;
  total_earnings: number;
  monthly_earnings: number;
  average_rating: number;
  total_appointments: number;
  upcoming_appointments: number;
}

export default function TailorDashboard() {
  const [profile, setProfile] = useState<TailorProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<TailorStats>({
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    in_progress_orders: 0,
    total_earnings: 0,
    monthly_earnings: 0,
    average_rating: 0,
    total_appointments: 0,
    upcoming_appointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;

  const fetchTailorData = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      let latestProfile: TailorProfile | null = null;

      // Fetch tailor profile
      const profileResponse = await fetch(`${API_URL}/api/users/tailor-profiles/my_profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        latestProfile = profileData;
        setProfile(profileData);
      }

      // Fetch orders (mock data for now - you'll need to create an API endpoint)
      const mockOrders: Order[] = [
        {
          id: 1,
          order_number: 'ORD-001',
          customer: { name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya@example.com' },
          status: 'in_progress',
          total_amount: 1200,
          order_date: '2025-10-18T10:00:00Z',
          expected_delivery_date: '2025-10-25',
          special_instructions: 'Please ensure perfect fit for wedding blouse'
        },
        {
          id: 2,
          order_number: 'ORD-002',
          customer: { name: 'Rajesh Kumar', phone: '+91 98765 43211', email: 'rajesh@example.com' },
          status: 'completed',
          total_amount: 800,
          order_date: '2025-10-15T14:00:00Z',
          expected_delivery_date: '2025-10-22',
          special_instructions: 'Formal shirt with premium finish'
        },
        {
          id: 3,
          order_number: 'ORD-003',
          customer: { name: 'Anita Patel', phone: '+91 98765 43212', email: 'anita@example.com' },
          status: 'pending',
          total_amount: 1500,
          order_date: '2025-10-20T09:00:00Z',
          expected_delivery_date: '2025-10-28',
          special_instructions: 'Designer saree blouse with intricate work'
        }
      ];
      setOrders(mockOrders);

      // Fetch appointments (mock data for now)
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          customer_name: 'Suresh Reddy',
          customer_phone: '+91 98765 43213',
          service_name: 'Shirt Tailoring',
          scheduled_date: '2025-10-21',
          scheduled_time: '10:00',
          status: 'confirmed',
          notes: 'Measurement and consultation'
        },
        {
          id: 2,
          customer_name: 'Meera Singh',
          customer_phone: '+91 98765 43214',
          service_name: 'Blouse Tailoring',
          scheduled_date: '2025-10-22',
          scheduled_time: '14:00',
          status: 'scheduled',
          notes: 'Wedding blouse consultation'
        }
      ];
      setAppointments(mockAppointments);

      // Calculate stats
      const calculatedStats: TailorStats = {
        total_orders: mockOrders.length,
        completed_orders: mockOrders.filter(o => o.status === 'completed').length,
        pending_orders: mockOrders.filter(o => o.status === 'pending').length,
        in_progress_orders: mockOrders.filter(o => o.status === 'in_progress').length,
        total_earnings: mockOrders.reduce((sum, o) => sum + o.total_amount, 0),
        monthly_earnings: mockOrders.filter(o => {
          const orderDate = new Date(o.order_date);
          const currentMonth = new Date().getMonth();
          return orderDate.getMonth() === currentMonth;
        }).reduce((sum, o) => sum + o.total_amount, 0),
        average_rating: latestProfile?.rating || 4.8,
        total_appointments: mockAppointments.length,
        upcoming_appointments: mockAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length
      };
      setStats(calculatedStats);

    } catch (error) {
      console.error('Error fetching tailor data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, router]);

  useEffect(() => {
    fetchTailorData();
  }, [fetchTailorData]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpertiseColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      case 'beginner': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tailor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="tailor">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Scissors className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Tailor Dashboard</h1>
                  <p className="text-gray-600 mt-1">
                    Welcome back, {profile?.user?.first_name || 'Tailor'}!
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    profile?.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.is_available ? 'Available' : 'Busy'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Card */}
          {profile && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <User className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.user.first_name} {profile.user.last_name}
                    </h2>
                    <p className="text-gray-600">{profile.user.email}</p>
                    <p className="text-gray-600">{profile.user.phone}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getExpertiseColor(profile.expertise_level)}`}>
                        {profile.expertise_level.charAt(0).toUpperCase() + profile.expertise_level.slice(1)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{profile.rating}</span>
                      </div>
                      <span className="text-sm text-gray-600">{profile.experience_years} years experience</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{profile.hourly_rate}/hr</p>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                </div>
              </div>
              
              {profile.bio && (
                <div className="mt-4">
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}

              {profile.specializations && profile.specializations.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec) => (
                      <span key={spec.id} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {spec.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed_orders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.in_progress_orders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.monthly_earnings}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', name: 'Overview', icon: TrendingUp },
                  { id: 'orders', name: 'Orders', icon: Package },
                  { id: 'appointments', name: 'Appointments', icon: Calendar },
                  { id: 'profile', name: 'Profile', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{order.order_number}</p>
                              <p className="text-sm text-gray-600">{order.customer.name}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                              <p className="text-sm font-medium text-gray-900 mt-1">₹{order.total_amount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
                      <div className="space-y-3">
                        {appointments.slice(0, 3).map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{appointment.customer_name}</p>
                              <p className="text-sm text-gray-600">{appointment.service_name}</p>
                              <p className="text-sm text-gray-500">{appointment.scheduled_date} at {appointment.scheduled_time}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <Award className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Average Rating</p>
                          <p className="text-2xl font-bold text-blue-900">{stats.average_rating}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <Target className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Completion Rate</p>
                          <p className="text-2xl font-bold text-green-900">
                            {stats.total_orders > 0 ? Math.round((stats.completed_orders / stats.total_orders) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-purple-600">Total Earnings</p>
                          <p className="text-2xl font-bold text-purple-900">₹{stats.total_earnings}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">All Orders</h3>
                    <button className="btn btn-primary btn-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Order
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                              <div className="text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                              <div className="text-sm text-gray-500">{order.customer.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{order.total_amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(order.expected_delivery_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Appointments Tab */}
              {activeTab === 'appointments' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                    <button className="btn btn-primary btn-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{appointment.customer_name}</h4>
                            <p className="text-sm text-gray-600">{appointment.service_name}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(appointment.scheduled_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {appointment.scheduled_time}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            {appointment.customer_phone}
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {appointment.notes}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 btn btn-outline btn-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button className="flex-1 btn btn-primary btn-sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        className="input"
                        rows={4}
                        placeholder="Tell customers about your experience and specialties..."
                        defaultValue={profile?.bio || ''}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (₹)</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="500"
                          defaultValue={profile?.hourly_rate || ''}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="5"
                          defaultValue={profile?.experience_years || ''}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="availability"
                            value="available"
                            defaultChecked={profile?.is_available}
                            className="mr-2"
                          />
                          Available
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="availability"
                            value="busy"
                            defaultChecked={!profile?.is_available}
                            className="mr-2"
                          />
                          Busy
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button className="btn btn-primary">
                        Save Changes
                      </button>
                      <button className="btn btn-outline">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
