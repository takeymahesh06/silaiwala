'use client';

import { useState, useEffect } from 'react';
import { 
  Ruler, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  User,
  Package,
  Calendar
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

interface Measurement {
  id?: number;
  order: number;
  customer_name: string;
  service_type: string;
  // Shirt measurements
  chest?: number;
  waist?: number;
  shoulder?: number;
  sleeve_length?: number;
  shirt_length?: number;
  neck?: number;
  // Blouse measurements
  bust?: number;
  blouse_length?: number;
  shoulder_width?: number;
  armhole?: number;
  // Suit measurements
  jacket_chest?: number;
  jacket_waist?: number;
  jacket_length?: number;
  trouser_waist?: number;
  trouser_length?: number;
  trouser_inseam?: number;
  // General measurements
  height?: number;
  weight?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

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
  status: string;
  total_amount: number;
}

export default function TailorMeasurementsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [measurements, setMeasurements] = useState<Measurement>({
    order: 0,
    customer_name: '',
    service_type: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAcceptedOrders();
  }, []);

  const fetchAcceptedOrders = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      const response = await fetch(`${API_URL}/api/orders/orders/?status=accepted`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.results || []);
      } else {
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
        preferred_time: '10:00 AM'
      },
      service_type: 'Wedding Dress Alteration',
      status: 'accepted',
      total_amount: 1500
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
      status: 'accepted',
      total_amount: 800
    }
  ];

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setMeasurements({
      order: order.id,
      customer_name: order.appointment.customer_name,
      service_type: order.service_type
    });
    setSuccess(false);
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value ? parseFloat(value) : undefined
    }));
  };

  const handleSaveMeasurements = async () => {
    setSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      const response = await fetch(`${API_URL}/api/orders/measurements/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurements),
      });

      if (response.ok) {
        setSuccess(true);
        // Update order status to in_progress
        await fetch(`${API_URL}/api/orders/orders/${selectedOrder?.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'in_progress' }),
        });
      } else {
        alert('Failed to save measurements');
      }
    } catch (error) {
      console.error('Error saving measurements:', error);
      alert('Failed to save measurements');
    } finally {
      setSaving(false);
    }
  };

  const getMeasurementFields = () => {
    const serviceType = measurements.service_type?.toLowerCase();
    
    if (serviceType?.includes('shirt')) {
      return [
        { label: 'Chest (inches)', field: 'chest' },
        { label: 'Waist (inches)', field: 'waist' },
        { label: 'Shoulder (inches)', field: 'shoulder' },
        { label: 'Sleeve Length (inches)', field: 'sleeve_length' },
        { label: 'Shirt Length (inches)', field: 'shirt_length' },
        { label: 'Neck (inches)', field: 'neck' }
      ];
    } else if (serviceType?.includes('blouse') || serviceType?.includes('dress')) {
      return [
        { label: 'Bust (inches)', field: 'bust' },
        { label: 'Blouse Length (inches)', field: 'blouse_length' },
        { label: 'Shoulder Width (inches)', field: 'shoulder_width' },
        { label: 'Armhole (inches)', field: 'armhole' },
        { label: 'Waist (inches)', field: 'waist' }
      ];
    } else if (serviceType?.includes('suit')) {
      return [
        { label: 'Jacket Chest (inches)', field: 'jacket_chest' },
        { label: 'Jacket Waist (inches)', field: 'jacket_waist' },
        { label: 'Jacket Length (inches)', field: 'jacket_length' },
        { label: 'Trouser Waist (inches)', field: 'trouser_waist' },
        { label: 'Trouser Length (inches)', field: 'trouser_length' },
        { label: 'Trouser Inseam (inches)', field: 'trouser_inseam' }
      ];
    } else {
      return [
        { label: 'Chest (inches)', field: 'chest' },
        { label: 'Waist (inches)', field: 'waist' },
        { label: 'Shoulder (inches)', field: 'shoulder' },
        { label: 'Length (inches)', field: 'shirt_length' }
      ];
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
              <div className="flex items-center space-x-4">
                <Link href="/tailor/orders" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Update Measurements</h1>
                  <p className="text-gray-600 mt-1">Record customer measurements for accepted orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedOrder ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Select an Order to Update Measurements</h2>
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">{order.service_type}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {order.appointment.customer_name}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {order.appointment.preferred_date}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOrderSelect(order)}
                        className="btn btn-primary btn-md"
                      >
                        <Ruler className="h-4 w-4 mr-2" />
                        Update Measurements
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No accepted orders</h3>
                  <p className="text-gray-500">You don&rsquo;t have any accepted orders to update measurements for.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Measurements for Order #{selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Customer:</span> {selectedOrder.appointment.customer_name}
                  </div>
                  <div>
                    <span className="font-medium">Service:</span> {selectedOrder.service_type}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedOrder.appointment.customer_phone}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> ₹{selectedOrder.total_amount}
                  </div>
                </div>
              </div>

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <CheckCircle className="inline h-5 w-5 mr-2" />
                  <span className="block sm:inline">Measurements saved successfully!</span>
                </div>
              )}

              {/* Measurements Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Measurement Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getMeasurementFields().map((field) => (
                    <div key={field.field}>
                      <label htmlFor={field.field} className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="number"
                        id={field.field}
                        step="0.1"
                        min="0"
                        value={measurements[field.field as keyof Measurement] || ''}
                        onChange={(e) => handleMeasurementChange(field.field, e.target.value)}
                        className="input"
                        placeholder="Enter measurement"
                      />
                    </div>
                  ))}
                  
                  {/* General measurements */}
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                      Height (inches)
                    </label>
                    <input
                      type="number"
                      id="height"
                      step="0.1"
                      min="0"
                      value={measurements.height || ''}
                      onChange={(e) => handleMeasurementChange('height', e.target.value)}
                      className="input"
                      placeholder="Enter height"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      id="weight"
                      step="0.1"
                      min="0"
                      value={measurements.weight || ''}
                      onChange={(e) => handleMeasurementChange('weight', e.target.value)}
                      className="input"
                      placeholder="Enter weight"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={measurements.notes || ''}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    placeholder="Any additional notes about measurements or requirements..."
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="btn btn-outline btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMeasurements}
                    disabled={saving}
                    className="btn btn-primary btn-md"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Measurements
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
