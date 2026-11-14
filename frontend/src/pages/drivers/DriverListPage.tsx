import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Users, Star, AlertTriangle } from 'lucide-react';
import { driverService } from '../../services/driverService';
import { Driver } from '../../types';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchBar } from '../../components/SearchBar';
import { FilterDropdown } from '../../components/FilterDropdown';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

export const DriverListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await driverService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setDrivers(data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load drivers', 'Could not retrieve driver registry.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, error]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await driverService.delete(deleteTargetId);
      success('Driver Removed', 'Driver record deleted.');
      setDeleteTargetId(null);
      fetchDrivers();
    } catch (err: any) {
      error('Delete failed', err.response?.data?.message || 'Could not delete driver');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      header: 'Driver Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xs">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.email} &bull; {row.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'licenseNumber',
      header: 'License Details',
      render: (row) => {
        const expiryDate = new Date(row.licenseExpiry);
        const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysLeft <= 90 && daysLeft > 0;
        const isExpired = daysLeft <= 0;

        return (
          <div className="text-xs">
            <span className="font-mono font-semibold text-slate-700">{row.licenseNumber}</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className={`text-[10px] ${isExpired ? 'text-rose-600 font-bold' : isExpiringSoon ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                Exp: {expiryDate.toLocaleDateString()}
              </span>
              {(isExpiringSoon || isExpired) && (
                <AlertTriangle className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'city',
      header: 'Base City',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-600">{row.city}</span>,
    },
    {
      key: 'experienceYears',
      header: 'Experience',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-700 font-medium">{row.experienceYears} yrs</span>,
    },
    {
      key: 'performanceRating',
      header: 'Rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-1 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-800">{row.performanceRating || 4.8}</span>
          <span className="text-[10px] text-slate-400">({row.totalDeliveries || 0} trips)</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="driver" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/drivers/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/drivers/${row.id}/edit`)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Driver"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Driver"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Driver Personnel Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage licensed drivers, performance ratings, license compliance, and trip history.
          </p>
        </div>

        <button
          onClick={() => navigate('/drivers/new')}
          className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Driver
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by driver name, phone, license..."
          className="w-full md:w-80"
        />

        <FilterDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Driver Statuses"
          options={[
            { label: 'Available', value: 'AVAILABLE' },
            { label: 'Assigned', value: 'ASSIGNED' },
            { label: 'On Delivery', value: 'ON_DELIVERY' },
            { label: 'On Leave', value: 'ON_LEAVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        isLoading={loading}
        onRowClick={(row) => navigate(`/drivers/${row.id}`)}
        emptyMessage="No drivers match the current filters."
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Remove Driver"
        message="Are you sure you want to remove this driver profile? Any active assignments should be reassigned first."
        confirmText="Remove"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
