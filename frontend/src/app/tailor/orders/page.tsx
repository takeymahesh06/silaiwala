'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

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
    notes: string;
  };
  service_type: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function TailorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      const response = await fetch(`${API_URL}/api/orders/orders/`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.results || []);
      } else {
        console.error('Failed to fetch orders');
        // Use mock data for development
        setOrders(getMockOrders());
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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
        preferred_time: '10:00 AM',
        notes: 'Need urgent alteration for wedding dress'
      },
      service_type: 'Wedding Dress Alteration',
      status: 'pending',
      total_amount: 1500,
      notes: 'Urgent wedding dress alteration required',
      created_at: '2025-10-20T10:00:00Z',
      updated_at: '2025-10-20T10:00:00Z'
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
        preferred_time: '2:00 PM',
        notes: 'Formal shirt tailoring'
      },
      service_type: 'Formal Shirt',
      status: 'accepted',
      total_amount: 800,
      notes: 'Formal shirt with custom measurements',
      created_at: '2025-10-19T15:30:00Z',
      updated_at: '2025-10-20T09:00:00Z'
    }
  ];

  const handleAcceptOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      const response = await fetch(`${API_URL}/api/orders/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'accepted' } : order
        ));
        setShowModal(false);
      } else {
        alert('Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      const response = await fetch(`${API_URL}/api/orders/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        ));
        setShowModal(false);
      } else {
        alert('Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order');
    } finally {
      setActionLoading(null);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-1">Manage your appointment orders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Orders List */}
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
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
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {order.appointment.customer_name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {order.appointment.preferred_date} at {order.appointment.preferred_time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {order.appointment.address}
                    </div>
                  </div>

                  {order.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="btn btn-primary btn-sm"
                      >
                        {actionLoading === order.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="btn btn-outline btn-sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">You don't have any orders yet.</p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedOrder.appointment.customer_name}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedOrder.appointment.customer_email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedOrder.appointment.customer_phone}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedOrder.appointment.address}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedOrder.appointment.preferred_date} at {selectedOrder.appointment.preferred_time}
                      </div>
                      <div>
                        <span className="font-medium">Service:</span> {selectedOrder.service_type}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> ₹{selectedOrder.total_amount}
                      </div>
                      {selectedOrder.appointment.notes && (
                        <div>
                          <span className="font-medium">Notes:</span> {selectedOrder.appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn btn-outline btn-md"
                  >
                    Close
                  </button>
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptOrder(selectedOrder.id)}
                        disabled={actionLoading === selectedOrder.id}
                        className="btn btn-primary btn-md"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleRejectOrder(selectedOrder.id)}
                        disabled={actionLoading === selectedOrder.id}
                        className="btn btn-outline btn-md"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
