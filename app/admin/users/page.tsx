'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardHeader,
  Button,
  Table,
  Badge,
  Modal,
  ModalFooter,
  LoadingSpinner,
} from '@/components/ui';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'supervisor' | 'psw';
  mfaEnabled: boolean;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'psw' as 'admin' | 'supervisor' | 'psw',
    password: '',
    active: true,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@tailoredcare.ca',
          fullName: 'System Administrator',
          role: 'admin',
          mfaEnabled: true,
          active: true,
          createdAt: '2025-01-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
        },
        {
          id: 2,
          username: 'sarah.johnson',
          email: 'sarah.johnson@tailoredcare.ca',
          fullName: 'Sarah Johnson',
          role: 'psw',
          mfaEnabled: true,
          active: true,
          createdAt: '2025-01-15T00:00:00Z',
          lastLogin: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: 3,
          username: 'michael.chen',
          email: 'michael.chen@tailoredcare.ca',
          fullName: 'Michael Chen',
          role: 'supervisor',
          mfaEnabled: true,
          active: true,
          createdAt: '2025-01-10T00:00:00Z',
          lastLogin: new Date(Date.now() - 5 * 3600000).toISOString(),
        },
        {
          id: 4,
          username: 'emma.wilson',
          email: 'emma.wilson@tailoredcare.ca',
          fullName: 'Emma Wilson',
          role: 'psw',
          mfaEnabled: false,
          active: true,
          createdAt: '2025-02-01T00:00:00Z',
          lastLogin: new Date(Date.now() - 24 * 3600000).toISOString(),
        },
        {
          id: 5,
          username: 'james.brown',
          email: 'james.brown@tailoredcare.ca',
          fullName: 'James Brown',
          role: 'psw',
          mfaEnabled: false,
          active: false,
          createdAt: '2024-12-15T00:00:00Z',
        },
      ];

      const filtered =
        filterRole === 'all'
          ? mockUsers
          : mockUsers.filter((u) => u.role === filterRole);

      setUsers(filtered);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'psw',
      password: '',
      active: true,
    });
    setShowAddModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      password: '',
      active: user.active,
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const saveUser = async () => {
    try {
      // API call to save user
      console.log('Saving user:', formData);
      await fetchUsers();
      setShowEditModal(false);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      // API call to delete user
      console.log('Deleting user:', selectedUser?.id);
      await fetchUsers();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      // API call to toggle user status
      console.log('Toggling status for user:', userId);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'danger' | 'warning' | 'info'> = {
      admin: 'danger',
      supervisor: 'warning',
      psw: 'info',
    };
    const icons: Record<string, string> = {
      admin: '👑',
      supervisor: '👨‍💼',
      psw: '👨‍⚕️',
    };
    return (
      <Badge variant={variants[role] || 'default'}>
        {icons[role]} {role.toUpperCase()}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
    },
    {
      key: 'fullName',
      header: 'Name',
      width: '200px',
      render: (value: string, row: User) => (
        <div>
          <p className="text-gray-900 font-medium">{value}</p>
          <p className="text-gray-500 text-xs">{row.username}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      width: '250px',
    },
    {
      key: 'role',
      header: 'Role',
      width: '150px',
      align: 'center' as const,
      render: (value: string) => getRoleBadge(value),
    },
    {
      key: 'mfaEnabled',
      header: 'MFA',
      width: '100px',
      align: 'center' as const,
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'warning'}>
          {value ? '🔒 Yes' : '⚠️ No'}
        </Badge>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      width: '120px',
      align: 'center' as const,
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'default'}>
          {value ? '✅ Active' : '⏸️ Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      width: '150px',
      render: (value?: string) =>
        value ? new Date(value).toLocaleDateString() : 'Never',
    },
    {
      key: 'id',
      header: 'Actions',
      width: '250px',
      align: 'center' as const,
      render: (_: any, row: User) => (
        <div className="flex items-center justify-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => handleEditUser(row)}>
            ✏️ Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleUserStatus(row.id)}
          >
            {row.active ? '⏸️' : '▶️'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteUser(row)}
          >
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light relative overflow-hidden">
      {/* Enhanced background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--tcs-gold)]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--tcs-blue-light)]/8 rounded-full blur-3xl" />
      </div>

      <Navigation
        user={{
          name: 'Admin User',
          role: 'admin',
          email: 'admin@tailoredcare.ca',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              User Management
            </h1>
            <p className="text-white/70 text-lg">
              Manage users, roles, and permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddUser}
              className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg px-6 py-3 font-semibold shadow-[0_10px_25px_rgba(201,160,99,0.4)] hover:shadow-[0_15px_35px_rgba(201,160,99,0.5)] transition-all"
            >
              ➕ Add User
            </button>
            <button
              onClick={fetchUsers}
              className="touch-target liquid-glass-light text-white rounded-glass-lg px-4 py-2 text-sm font-semibold border border-white/20 hover:border-white/30 transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="text-center">
              <p className="text-white text-3xl font-bold">
                {users.length}
              </p>
              <p className="text-white/70 text-sm">Total Users</p>
            </div>
          </div>
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="text-center">
              <p className="text-green-300 text-3xl font-bold">
                {users.filter((u) => u.active).length}
              </p>
              <p className="text-white/70 text-sm">Active Users</p>
            </div>
          </div>
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="text-center">
              <p className="text-[var(--tcs-gold)] text-3xl font-bold">
                {users.filter((u) => u.mfaEnabled).length}
              </p>
              <p className="text-white/70 text-sm">MFA Enabled</p>
            </div>
          </div>
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="text-center">
              <p className="text-red-300 text-3xl font-bold">
                {users.filter((u) => u.role === 'admin').length}
              </p>
              <p className="text-white/70 text-sm">Administrators</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="liquid-glass-card rounded-glass-lg mb-6 p-4 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-white text-sm font-medium">
              Filter by role:
            </span>
            {['all', 'admin', 'supervisor', 'psw'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`touch-target rounded-glass-lg px-4 py-2 text-sm font-semibold transition-all ${
                  filterRole === role
                    ? 'liquid-glass-gold text-[var(--tcs-blue-deep)] shadow-[0_8px_20px_rgba(201,160,99,0.4)]'
                    : 'liquid-glass-light text-white border border-white/20 hover:border-white/30'
                }`}
              >
                {role === 'all' ? 'All' : role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner size="lg" text="Loading users..." />
        ) : (
          <Table
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage="No users found"
          />
        )}
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        title={showAddModal ? 'Add New User' : 'Edit User'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-gray-700 mb-1 block text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-1 block text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-1 block text-sm font-medium">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as any })
              }
              className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
            >
              <option value="psw">PSW - Personal Support Worker</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {showAddModal && (
            <div>
              <label className="text-gray-700 mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="rounded h-4 w-4 text-[#1B365D] focus:ring-[#1B365D]"
            />
            <label htmlFor="active" className="text-gray-700 text-sm">
              Active user
            </label>
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={saveUser}>
            {showAddModal ? 'Create User' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete user{' '}
            <span className="font-bold">{selectedUser?.fullName}</span>?
          </p>
          <p className="text-gray-600 text-sm">
            This action cannot be undone. All user data and associated reports
            will remain but will be unlinked from this user account.
          </p>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete User
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
