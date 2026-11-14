import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Navigation, Trash2, Zap, Clock, MapPin } from 'lucide-react';
import { routeService } from '../../services/routeService';
import { Route } from '../../types';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchBar } from '../../components/SearchBar';
import { FilterDropdown } from '../../components/FilterDropdown';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

export const RouteListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await routeService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setRoutes(data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load routes', 'Could not retrieve logistics routes.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, error]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await routeService.delete(deleteTargetId);
      success('Route Removed', 'Delivery route plan deleted.');
      setDeleteTargetId(null);
      fetchRoutes();
    } catch (err: any) {
      error('Delete failed', err.response?.data?.message || 'Could not delete route');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Route>[] = [
    {
      key: 'name',
      header: 'Route Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs">{row.name}</span>
          <span className="block text-[11px] text-slate-400">
            {row.originName} &rarr; {row.stops?.[row.stops.length - 1]?.city || 'Multiple stops'}
          </span>
        </div>
      ),
    },
    {
      key: 'stops',
      header: 'Stops',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.stops ? row.stops.length : 0} stops
        </span>
      ),
    },
    {
      key: 'totalDistanceKm',
      header: 'Distance',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800">{row.totalDistanceKm} km</span>
        </div>
      ),
    },
    {
      key: 'estimatedDurationMin',
      header: 'Est. Duration',
      sortable: true,
      render: (row) => {
        const hours = Math.floor(row.estimatedDurationMin / 60);
        const mins = row.estimatedDurationMin % 60;
        return (
          <span className="text-xs text-slate-600 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{hours > 0 ? `${hours}h ${mins}m` : `${mins} min`}</span>
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="route" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/routes/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="View Route & Map"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Route"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Delivery Routes Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimize corridor waypoints, mileage consumption, and scheduled road trajectories.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/routes/optimize')}
            className="inline-flex items-center px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-xl transition-all"
          >
            <Zap className="w-4 h-4 mr-1.5 text-emerald-600" />
            AI Route Optimizer
          </button>
          <button
            onClick={() => navigate('/routes/new')}
            className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Route
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by route name, start point, destination..."
          className="w-full md:w-80"
        />

        <FilterDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Route Statuses"
          options={[
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Planned', value: 'PLANNED' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={routes}
        isLoading={loading}
        onRowClick={(row) => navigate(`/routes/${row.id}`)}
        emptyMessage="No routes match the current search filters."
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Delivery Route"
        message="Are you sure you want to remove this delivery route plan? Dispatched vehicles mapped to this route may be unassigned."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
