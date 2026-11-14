import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Edit, Trash2, Shield, User, Mail, Lock } from 'lucide-react';
import { userService } from '../../services/userService';
import { User as UserType, Role } from '../../types';
import { DataTable, Column } from '../../components/DataTable';
import { SearchBar } from '../../components/SearchBar';
import { FilterDropdown } from '../../components/FilterDropdown';
import { Modal } from '../../components/Modal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

export const UserManagementPage: React.FC = () => {
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('DISPATCHER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load users', 'Could not retrieve staff accounts.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, error]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('DISPATCHER');
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserType) => {
    setIsEditing(true);
    setEditUserId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && editUserId) {
        await userService.update(editUserId, {
          name,
          email,
          role,
        });
        success('User Updated', `Account for ${name} updated.`);
      } else {
        await userService.create({
          name,
          email,
          password,
          role,
        });
        success('User Created', `User account created for ${name}.`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      error('Operation failed', err.response?.data?.message || 'Could not save user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await userService.delete(deleteTargetId);
      success('User Removed', 'Account deleted from FleetOps.');
      setDeleteTargetId(null);
      fetchUsers();
    } catch (err: any) {
      error('Delete failed', err.response?.data?.message || 'Could not delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<UserType>[] = [
    {
      key: 'name',
      header: 'User / Identity',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xs">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Access Role',
      sortable: true,
      render: (row) => {
        const roleColors: Record<string, string> = {
          ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
          DISPATCHER: 'bg-blue-50 text-blue-700 border-blue-200',
          DRIVER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
        return (
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              roleColors[row.role] || 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {row.role}
          </span>
        );
      },
    },

    {
      key: 'createdAt',
      header: 'Enrolled Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            User Accounts & Role Permissions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer system roles, login credentials, and dispatcher authorization scopes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add User
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email..."
          className="w-full md:w-80"
        />

        <FilterDropdown
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="All Roles"
          options={[
            { label: 'Admin', value: 'ADMIN' },
            { label: 'Dispatcher', value: 'DISPATCHER' },
            { label: 'Driver', value: 'DRIVER' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={loading}
        emptyMessage="No staff accounts match the filter criteria."
      />

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Modify User Account' : 'Enroll New User'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Initial temporary password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Access Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
            >
              <option value="ADMIN">Admin</option>
              <option value="DISPATCHER">Dispatcher</option>
              <option value="DRIVER">Driver</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Revoke & Delete User"
        message="Are you sure you want to permanently delete this user account? Access tokens will immediately be invalidated."
        confirmText="Delete Account"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
