'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Shield,
  User,
  Scissors,
  Briefcase,
  Crown
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'tailor' | 'customer';
  is_verified: boolean;
  is_active: boolean;
  phone: string;
  created_at: string;
}

interface UserStats {
  total_users: number;
  total_customers: number;
  total_tailors: number;
  total_staff: number;
  verified_users: number;
  active_users: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    total_customers: 0,
    total_tailors: 0,
    total_staff: 0,
    verified_users: 0,
    active_users: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const apiBaseUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL ?? 'http://localhost:8000';
  
  const fetchUsers = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${apiBaseUrl}/api/users/users/`, {
        headers: {
          'Authorization': token ? `Token ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data.results) ? data.results : data);
      } else if (response.status === 403) {
        console.error('Permission denied: Admin access required');
        setUsers([]);
        setHasPermission(false);
      } else {
        console.error('Failed to fetch users');
        setUsers(getMockUsers());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers(getMockUsers());
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/dashboard/stats/`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats(getMockStats());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(getMockStats());
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const getMockUsers = (): UserData[] => [
    {
      id: 1,
      username: 'admin',
      email: 'admin@silaiwala.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_verified: true,
      is_active: true,
      phone: '+91 98765 00001',
      created_at: '2025-10-19T20:58:34.130696Z'
    },
    {
      id: 2,
      username: 'tailor1',
      email: 'tailor1@silaiwala.com',
      first_name: 'Amit',
      last_name: 'Patel',
      role: 'tailor',
      is_verified: true,
      is_active: true,
      phone: '+91 98765 00004',
      created_at: '2025-10-19T20:58:34.130696Z'
    },
    {
      id: 3,
      username: 'customer1',
      email: 'customer1@example.com',
      first_name: 'Ravi',
      last_name: 'Singh',
      role: 'customer',
      is_verified: true,
      is_active: true,
      phone: '+91 98765 00006',
      created_at: '2025-10-19T20:58:34.130696Z'
    }
  ];

  const getMockStats = (): UserStats => ({
    total_users: 25,
    total_customers: 15,
    total_tailors: 6,
    total_staff: 4,
    verified_users: 20,
    active_users: 22
  });

  const handleUserAction = async (userId: number, action: string, data?: Record<string, unknown>) => {
    try {
      let response: Response | undefined;
      
      switch (action) {
        case 'verify':
          response = await fetch(`${apiBaseUrl}/api/users/users/${userId}/verify_user/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          break;
        case 'deactivate':
          response = await fetch(`${apiBaseUrl}/api/users/users/${userId}/deactivate_user/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          break;
        case 'update':
          response = await fetch(`${apiBaseUrl}/api/users/users/${userId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined
          });
          break;
      }

      if (response?.ok) {
        fetchUsers();
        fetchStats();
        setShowModal(false);
      } else {
        console.error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'staff': return Briefcase;
      case 'tailor': return Scissors;
      case 'customer': return User;
      default: return User;
    }
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active) ||
                         (statusFilter === 'verified' && user.is_verified) ||
                         (statusFilter === 'unverified' && !user.is_verified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don&rsquo;t have permission to access user management.</p>
          <p className="text-sm text-gray-500">Admin access is required to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-md"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <User className="h-8 w-8 text-purple-600" />
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
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_staff}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card bg-white p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="tailor">Tailor</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="btn btn-outline btn-md w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <RoleIcon className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {user.is_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </span>
                          )}
                          {user.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'verify')}
                            className="text-green-600 hover:text-green-900"
                            title="Verify User"
                            disabled={user.is_verified}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'deactivate')}
                            className="text-red-600 hover:text-red-900"
                            title="Deactivate User"
                            disabled={!user.is_active}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="flex space-x-2">
                      {selectedUser.is_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                      {selectedUser.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
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
                  {!selectedUser.is_verified && (
                    <button
                      onClick={() => handleUserAction(selectedUser.id, 'verify')}
                      className="btn btn-primary btn-md"
                    >
                      Verify User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </AuthGuard>
  );
}
