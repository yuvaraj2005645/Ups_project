import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Navigation, Trash2, Filter } from "lucide-react";
import { shipmentService } from "../../services/shipmentService";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { SearchBar } from "../../components/SearchBar";
import { FilterDropdown } from "../../components/FilterDropdown";
import { Pagination } from "../../components/Pagination";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/Toast";
export const ShipmentListPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await shipmentService.getAll({
        search: search || void 0,
        status: statusFilter || void 0,
        priority: priorityFilter || void 0
      });
      setShipments(data || []);
    } catch (err) {
      console.error(err);
      error("Failed to load shipments", "Unable to retrieve shipment records.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, error]);
  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await shipmentService.delete(deleteTargetId);
      success("Shipment deleted", "The shipment record has been removed.");
      setDeleteTargetId(null);
      fetchShipments();
    } catch (err) {
      error("Delete failed", err.response?.data?.message || "Could not delete shipment.");
    } finally {
      setIsDeleting(false);
    }
  };
  const totalItems = shipments.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedShipments = shipments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const columns = [
    {
      key: "id",
      header: "Shipment ID",
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-semibold text-primary">
          #{row.id.slice(-6).toUpperCase()}</span>
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      render: (row) => <div><p className="font-medium text-slate-800">{row.customerName}</p><p className="text-[11px] text-slate-400 truncate max-w-[150px]">{row.packageDescription}</p></div>
    },
    {
      key: "pickupAddress",
      header: "Pickup & Delivery",
      render: (row) => <div className="text-xs space-y-0.5"><p className="text-slate-700 truncate max-w-[200px]" title={row.pickupAddress}><span className="text-slate-400 font-semibold mr-1">From:</span>{row.pickupAddress}</p><p className="text-slate-700 truncate max-w-[200px]" title={row.deliveryAddress}><span className="text-slate-400 font-semibold mr-1">To:</span>{row.deliveryAddress}</p></div>
    },
    {
      key: "weightKg",
      header: "Specs",
      sortable: true,
      render: (row) => <div className="text-xs"><span className="font-semibold text-slate-700">{row.weightKg} kg</span><span className="block text-[11px] text-slate-400">{row.volumeM3} m&sup3;</span></div>
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (row) => <StatusBadge status={row.priority} type="priority" />
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="shipment" />
    },
    {
      key: "expectedDeliveryDate",
      header: "Expected Delivery",
      sortable: true,
      render: (row) => <span className="text-xs text-slate-600">{row.expectedDeliveryDate ? new Date(row.expectedDeliveryDate).toLocaleDateString() : "-"}</span>
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}><button
        onClick={() => navigate(`/shipments/${row.id}`)}
        className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      ><Eye className="w-4 h-4" /></button><button
        onClick={() => navigate(`/shipments/${row.id}/tracking`)}
        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        title="Track Route & History"
      ><Navigation className="w-4 h-4" /></button><button
        onClick={() => setDeleteTargetId(row.id)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        title="Delete Shipment"
      ><Trash2 className="w-4 h-4" /></button></div>
    }
  ];
  return <div className="space-y-6">{
    /* Header bar */
  }<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">Shipments Directory</h2><p className="text-xs text-slate-500 mt-0.5">
            Manage packages, order fulfillment states, and vehicle consignments.
          </p></div><button
    onClick={() => navigate("/shipments/new")}
    className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
  ><Plus className="w-4 h-4 mr-1.5" />
          Create Shipment
        </button></div>{
    /* Filter and Search Bar */
  }<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"><SearchBar
    value={search}
    onChange={(val) => {
      setSearch(val);
      setCurrentPage(1);
    }}
    placeholder="Search by customer, address, description..."
    className="w-full md:w-80"
  /><div className="flex flex-wrap items-center gap-2.5"><Filter className="w-4 h-4 text-slate-400 hidden sm:block" /><FilterDropdown
    value={statusFilter}
    onChange={(val) => {
      setStatusFilter(val);
      setCurrentPage(1);
    }}
    placeholder="All Statuses"
    options={[
      { label: "Pending", value: "PENDING" },
      { label: "Scheduled", value: "SCHEDULED" },
      { label: "Assigned", value: "ASSIGNED" },
      { label: "In Transit", value: "IN_TRANSIT" },
      { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
      { label: "Delivered", value: "DELIVERED" },
      { label: "Delayed", value: "DELAYED" },
      { label: "Cancelled", value: "CANCELLED" }
    ]}
  /><FilterDropdown
    value={priorityFilter}
    onChange={(val) => {
      setPriorityFilter(val);
      setCurrentPage(1);
    }}
    placeholder="All Priorities"
    options={[
      { label: "Low", value: "LOW" },
      { label: "Standard", value: "STANDARD" },
      { label: "High", value: "HIGH" },
      { label: "Urgent", value: "URGENT" }
    ]}
  /></div></div>{
    /* Shipments Table */
  }<DataTable
    columns={columns}
    data={paginatedShipments}
    isLoading={loading}
    onRowClick={(row) => navigate(`/shipments/${row.id}`)}
    emptyMessage="No shipments match the selected filters."
  />{
    /* Pagination */
  }<Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    totalItems={totalItems}
    pageSize={pageSize}
  />{
    /* Delete Confirmation Modal */
  }<ConfirmModal
    isOpen={!!deleteTargetId}
    onClose={() => setDeleteTargetId(null)}
    onConfirm={handleDelete}
    title="Delete Shipment"
    message="Are you sure you want to permanently delete this shipment record? This action cannot be reversed."
    confirmText="Delete"
    variant="danger"
    isLoading={isDeleting}
  /></div>;
};
