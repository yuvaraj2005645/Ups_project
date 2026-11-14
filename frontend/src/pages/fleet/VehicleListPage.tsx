import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Truck, CheckCircle2, Clock, Wrench, Cpu } from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchBar } from '../../components/SearchBar';
import { FilterDropdown } from '../../components/FilterDropdown';
import { ProgressBar } from '../../components/ProgressBar';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

export const VehicleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setVehicles(data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load fleet', 'Unable to retrieve vehicle assets.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, error]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await vehicleService.delete(deleteTargetId);
      success('Vehicle Removed', 'Fleet asset has been deleted.');
      setDeleteTargetId(null);
      fetchVehicles();
    } catch (err: any) {
      error('Delete failed', err.response?.data?.message || 'Failed to remove vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const inTransitCount = vehicles.filter((v) => v.status === 'IN_TRANSIT').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'UNDER_MAINTENANCE').length;

  const columns: Column<Vehicle>[] = [
    {
      key: 'registrationNumber',
      header: 'Reg Number',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-800 text-xs">
            {row.registrationNumber}
          </span>
          <span className="block text-[11px] text-slate-400">
            {row.manufacturer} {row.model} ({row.year})
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Vehicle Type',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
          {row.type?.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'currentWeightKg',
      header: 'Weight Load',
      render: (row) => (
        <div className="w-36">
          <ProgressBar
            value={row.currentWeightKg || 0}
            max={row.maxWeightKg || 1000}
            currentValue={row.currentWeightKg || 0}
            unit="kg"
            size="sm"
          />
        </div>
      ),
    },
    {
      key: 'currentVolumeM3',
      header: 'Volume Load',
      render: (row) => (
        <div className="w-36">
          <ProgressBar
            value={row.currentVolumeM3 || 0}
            max={row.maxVolumeM3 || 10}
            currentValue={row.currentVolumeM3 || 0}
            unit="m³"
            size="sm"
          />
        </div>
      ),
    },
    {
      key: 'fuelType',
      header: 'Fuel / Color',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.fuelType} &bull; {row.color}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="vehicle" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/fleet/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/fleet/${row.id}/edit`)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Asset"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Vehicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Asset Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor truck capacities, fuel profiles, service status, and dispatch assignments.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/fleet/allocate')}
            className="inline-flex items-center px-3.5 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition-all"
          >
            <Cpu className="w-4 h-4 mr-1.5 text-indigo-600" />
            Capacity Allocation Engine
          </button>
          <button
            onClick={() => navigate('/fleet/new')}
            className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-primary">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{totalCount}</p>
            <p className="text-xs text-slate-400">Total Fleet</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{availableCount}</p>
            <p className="text-xs text-slate-400">Available</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{inTransitCount}</p>
            <p className="text-xs text-slate-400">In Transit</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{maintenanceCount}</p>
            <p className="text-xs text-slate-400">Maintenance</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by registration, model, manufacturer..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            options={[
              { label: 'Available', value: 'AVAILABLE' },
              { label: 'Assigned', value: 'ASSIGNED' },
              { label: 'In Transit', value: 'IN_TRANSIT' },
              { label: 'Under Maintenance', value: 'UNDER_MAINTENANCE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ]}
          />
          <FilterDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="All Vehicle Types"
            options={[
              { label: 'Mini Truck', value: 'MINI_TRUCK' },
              { label: 'Delivery Van', value: 'DELIVERY_VAN' },
              { label: 'Pickup Truck', value: 'PICKUP_TRUCK' },
              { label: 'Heavy Truck', value: 'HEAVY_TRUCK' },
              { label: 'Container Truck', value: 'CONTAINER_TRUCK' },
            ]}
          />
        </div>
      </div>

      {/* Fleet Table */}
      <DataTable
        columns={columns}
        data={vehicles}
        isLoading={loading}
        onRowClick={(row) => navigate(`/fleet/${row.id}`)}
        emptyMessage="No vehicles found matching current criteria."
      />

      {/* Confirm Deletion */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Remove Vehicle"
        message="Are you sure you want to delete this vehicle from active fleet inventory? Historical assignments may be detached."
        confirmText="Remove"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
