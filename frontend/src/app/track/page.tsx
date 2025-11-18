'use client';

import { useState } from 'react';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Order {
  id: number;
  appointment: {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    address: string;
    preferred_date: string;
    preferred_time: string;
  };
  service_type: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
  measurements?: {
    id: number;
    chest?: number;
    waist?: number;
    shoulder?: number;
    sleeve_length?: number;
    shirt_length?: number;
    neck?: number;
    bust?: number;
    blouse_length?: number;
    shoulder_width?: number;
    armhole?: number;
    height?: number;
    weight?: number;
    notes?: string;
  };
}

export default function TrackOrderPage() {
  const [searchType, setSearchType] = useState<'phone' | 'order_id'>('phone');
  const [searchValue, setSearchValue] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setError(null);
    setOrders([]);

    try {
      const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      let url = `${API_URL}/api/orders/orders/`;
      
      if (searchType === 'phone') {
        url += `?customer_phone=${encodeURIComponent(searchValue)}`;
      } else {
        url += `?id=${searchValue}`;
      }

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.results || []);
        
        if (data.results?.length === 0) {
          setError('No orders found with the provided information.');
        }
      } else {
        // Use mock data for development
        setOrders(getMockOrders());
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = (): Order[] => [
    {
      id: 1,
      appointment: {
        id: 1,
        customer_name: 'Priya Sharma',
        customer_email: 'priya@example.com',
        customer_phone: '+91 98765 43210',
        address: '123 MG Road, Bangalore',
        preferred_date: '2025-10-25',
        preferred_time: '10:00 AM'
      },
      service_type: 'Wedding Dress Alteration',
      status: 'in_progress',
      total_amount: 1500,
      notes: 'Urgent wedding dress alteration required',
      created_at: '2025-10-20T10:00:00Z',
      updated_at: '2025-10-22T14:30:00Z',
      measurements: {
        id: 1,
        bust: 36,
        blouse_length: 24,
        shoulder_width: 14,
        armhole: 8,
        waist: 28,
        height: 65,
        weight: 55,
        notes: 'Customer prefers slightly loose fit'
      }
    },
    {
      id: 2,
      appointment: {
        id: 2,
        customer_name: 'Rajesh Kumar',
        customer_email: 'rajesh@example.com',
        customer_phone: '+91 98765 43211',
        address: '456 Brigade Road, Bangalore',
        preferred_date: '2025-10-26',
        preferred_time: '2:00 PM'
      },
      service_type: 'Formal Shirt',
      status: 'completed',
      total_amount: 800,
      notes: 'Formal shirt with custom measurements',
      created_at: '2025-10-19T15:30:00Z',
      updated_at: '2025-10-25T16:00:00Z',
      measurements: {
        id: 2,
        chest: 42,
        waist: 36,
        shoulder: 18,
        sleeve_length: 24,
        shirt_length: 30,
        neck: 16,
        height: 70,
        weight: 75
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'in_progress': return Package;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Your order is pending approval from a tailor.';
      case 'accepted': return 'Your order has been accepted by a tailor.';
      case 'in_progress': return 'Your order is currently being worked on.';
      case 'completed': return 'Your order has been completed and is ready for pickup/delivery.';
      case 'cancelled': return 'Your order has been cancelled.';
      default: return 'Unknown status.';
    }
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { name: 'Order Placed', completed: true },
      { name: 'Order Accepted', completed: ['accepted', 'in_progress', 'completed'].includes(status) },
      { name: 'Measurements Taken', completed: ['in_progress', 'completed'].includes(status) },
      { name: 'Work in Progress', completed: ['in_progress', 'completed'].includes(status) },
      { name: 'Completed', completed: status === 'completed' }
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600 mt-1">Enter your phone number or order ID to track your order status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="search-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Search by
                </label>
                <select
                  id="search-type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'phone' | 'order_id')}
                  className="input"
                >
                  <option value="phone">Phone Number</option>
                  <option value="order_id">Order ID</option>
                </select>
              </div>
              <div className="flex-2">
                <label htmlFor="search-value" className="block text-sm font-medium text-gray-700 mb-2">
                  {searchType === 'phone' ? 'Phone Number' : 'Order ID'}
                </label>
                <input
                  type={searchType === 'phone' ? 'tel' : 'text'}
                  id="search-value"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'phone' ? '+91 98765 43210' : '12345'}
                  className="input"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-md"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <AlertCircle className="inline h-5 w-5 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              const progressSteps = getProgressSteps(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.service_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        <StatusIcon className="inline h-4 w-4 mr-1" />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="mb-6">
                    <p className="text-gray-700">{getStatusMessage(order.status)}</p>
                  </div>

                  {/* Progress Steps */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Order Progress</h4>
                    <div className="flex items-center space-x-4">
                      {progressSteps.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </div>
                          <span className={`ml-2 text-sm ${
                            step.completed ? 'text-green-800' : 'text-gray-400'
                          }`}>
                            {step.name}
                          </span>
                          {index < progressSteps.length - 1 && (
                            <div className={`w-8 h-0.5 mx-2 ${
                              step.completed ? 'bg-green-200' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  {selectedOrder?.id === order.id && (
                    <div className="border-t pt-6 space-y-6">
                      {/* Customer Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {order.appointment.customer_name}
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {order.appointment.customer_email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {order.appointment.customer_phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {order.appointment.address}
                          </div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Appointment Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {order.appointment.preferred_date} at {order.appointment.preferred_time}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> ₹{order.total_amount}
                          </div>
                          {order.notes && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Notes:</span> {order.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Measurements */}
                      {order.measurements && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Measurements</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {Object.entries(order.measurements)
                              .filter(([key, value]) => key !== 'id' && key !== 'notes' && value !== undefined)
                              .map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium capitalize">
                                    {key.replace(/_/g, ' ')}:
                                  </span> {value}
                                </div>
                              ))}
                            {order.measurements.notes && (
                              <div className="md:col-span-4">
                                <span className="font-medium">Notes:</span> {order.measurements.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Order Created:</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Updated:</span>
                            <span>{new Date(order.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && orders.length === 0 && !error && searchValue && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Please check your search criteria and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
