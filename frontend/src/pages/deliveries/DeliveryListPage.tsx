import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Truck, CheckCircle2, Clock, Calendar, Filter } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { Delivery } from '../../types';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchBar } from '../../components/SearchBar';
import { FilterDropdown } from '../../components/FilterDropdown';
import { useToast } from '../../components/Toast';

export const DeliveryListPage: React.FC = () => {
  const navigate = useNavigate();
  const { error } = useToast();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setDeliveries(data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load deliveries', 'Could not retrieve delivery dispatches.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, error]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const columns: Column<Delivery>[] = [
    {
      key: 'id',
      header: 'Delivery ID',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-primary">
          #{row.id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'shipmentId',
      header: 'Shipment',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          #{row.shipmentId ? row.shipmentId.slice(-6).toUpperCase() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'destinationAddress',
      header: 'Destination',
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800 truncate max-w-xs">{row.destinationAddress}</p>
          <p className="text-[11px] text-slate-400">{row.destinationCity}</p>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled Date',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-600">{row.scheduledDate}</span>,
    },
    {
      key: 'deliveryDate',
      header: 'Delivered Time',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.deliveryDate ? new Date(row.deliveryDate).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      key: 'receiverName',
      header: 'Recipient',
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">{row.receiverName || 'Pending'}</span>
          {row.proofOfDelivery?.signatureUrl && (
            <span className="block text-[10px] text-emerald-600 font-semibold">Signed POD</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="delivery" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/deliveries/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="View Delivery Record"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Deliveries Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time proof of deliveries, receiver signatures, and dispatch completion rates.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by receiver, address, delivery ID..."
          className="w-full md:w-80"
        />

        <FilterDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Delivery Statuses"
          options={[
            { label: 'Scheduled', value: 'SCHEDULED' },
            { label: 'Out For Delivery', value: 'OUT_FOR_DELIVERY' },
            { label: 'Delivered', value: 'DELIVERED' },
            { label: 'Failed Delivery', value: 'FAILED_DELIVERY' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={deliveries}
        isLoading={loading}
        onRowClick={(row) => navigate(`/deliveries/${row.id}`)}
        emptyMessage="No delivery dispatches match the current filter criteria."
      />
    </div>
  );
};
