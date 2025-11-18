'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Search, Eye, Edit, Trash2, Plus } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { apiRequest } from '@/lib/api';

interface Appointment {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  address: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const response = await apiRequest('/api/appointments/appointments/', {
          headers: {
            'Authorization': token ? `Token ${token}` : '',
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Transform the API data to match our interface
          const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
          const transformedAppointments = list.map((appointment: Record<string, unknown>) => {
            const customer = appointment.customer as Record<string, unknown> || {};
            const service = appointment.service as Record<string, unknown> || {};
            
            return {
              id: appointment.id as number,
              customer_name: (appointment.customer_name as string) || (customer.name as string) || 'N/A',
              customer_email: (appointment.customer_email as string) || (customer.email as string) || 'N/A',
              customer_phone: (appointment.customer_phone as string) || (customer.phone as string) || 'N/A',
              service: (appointment.service_name as string) || (service.name as string) || 'N/A',
              appointment_date: (appointment.appointment_date as string) || (appointment.scheduled_date as string) || '',
              appointment_time: (appointment.appointment_time as string) || (appointment.scheduled_time as string) || '',
              address: (appointment.address as string) || (customer.address as string) || '',
              notes: (appointment.notes as string) || '',
              status: (appointment.status as Appointment['status']) || 'pending',
              created_at: (appointment.created_at as string) || ''
            };
          });
          
          setAppointments(transformedAppointments);
        } else {
          console.error('Failed to fetch appointments');
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // No mock data; show empty state if API has no data

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      // Update status via API
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiRequest(`/api/appointments/appointments/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Token ${token}` : '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setAppointments(prev => 
          prev.map(appointment => 
            appointment.id === id 
              ? { ...appointment, status: newStatus as Appointment['status'] }
              : appointment
          )
        );
      } else {
        console.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Still update local state for better UX
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id 
            ? { ...appointment, status: newStatus as Appointment['status'] }
            : appointment
        )
      );
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const getStats = () => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    
    return { total, pending, confirmed, completed };
  };

  const stats = getStats();

  const handleCreateOrder = async (appointmentId: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await apiRequest(`/api/appointments/appointments/${appointmentId}/create_order/`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Token ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to create order: ${errorData.detail || 'Unknown error'}`);
        return;
      }
      const data = await res.json();
      alert(`Order created successfully! Order ID: ${data.order_id || 'N/A'}`);
    } catch (e) {
      console.error('Error creating order:', e);
      alert('Failed to create order. Please try again.');
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await apiRequest(`/api/appointments/appointments/${appointmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Token ${token}` : '',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to delete appointment: ${errorData.detail || 'Unknown error'}`);
        return;
      }
      
      // Remove from local state
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
      alert('Appointment deleted successfully!');
    } catch (e) {
      console.error('Error deleting appointment:', e);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    // For now, just show the modal with edit option
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage appointments and orders</p>
            </div>
            <button 
              onClick={() => window.open('/book', '_blank')}
              className="btn btn-primary btn-md inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Scissors className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.customer_email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.appointment_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {appointment.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCreateOrder(appointment.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Create Order"
                          >
                            {/* plus icon from lucide-react already imported as Plus */}
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Appointment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Appointment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.customer_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.customer_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.customer_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.service}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedAppointment.appointment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.appointment_time}</p>
                  </div>
                </div>
                
                {selectedAppointment.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.address}</p>
                  </div>
                )}
                
                {selectedAppointment.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.notes}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedAppointment.status]}`}>
                    {statusLabels[selectedAppointment.status]}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline btn-md"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    // For now, just show an alert. In a real app, you'd open an edit form
                    alert('Edit functionality coming soon! For now, you can update the status using the dropdown in the table.');
                  }}
                  className="btn btn-primary btn-md"
                >
                  Edit Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}
