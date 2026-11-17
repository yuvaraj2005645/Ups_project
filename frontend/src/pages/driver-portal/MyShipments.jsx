import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  Eye,
  Play,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  MapPin,
  Calendar,
  Weight,
  User,
  FileText,
} from "lucide-react";
import { driverService } from "../../services/driverService";
import { shipmentService } from "../../services/shipmentService";
import { useToast } from "../../components/Toast";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate, formatWeight, formatVolume, getStatusColor, formatStatus, getDriverAllowedTransitions } from "../../utils/formatters";

const ITEMS_PER_PAGE = 8;

const statuses = ["ALL", "PENDING", "SCHEDULED", "ASSIGNED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "DELAYED", "CANCELLED", "FAILED_DELIVERY", "RETURNED"];

export const MyShipments = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [driver, setDriver] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await driverService.getMe();
      setDriver(d);
      const list = await driverService.getDriverShipments(d.id);
      setShipments(list || []);
    } catch (err) {
      error("Error", err.response?.data?.message || "Failed to load shipments.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetails = async (s) => {
    setSelectedShipment(s);
    setHistoryLoading(true);
    try {
      const h = await shipmentService.getHistory(s.id);
      setHistory(h || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStartDelivery = async (shipment) => {
    const allowed = getDriverAllowedTransitions(shipment.status);
    if (!allowed.includes("IN_TRANSIT")) {
      error("Not Allowed", `Cannot start delivery from status "${formatStatus(shipment.status)}".`);
      return;
    }
    setUpdatingId(shipment.id);
    try {
      await shipmentService.updateStatus(shipment.id, "IN_TRANSIT", "Driver started delivery");
      success("Started", `Shipment ${shipment.id} is now In Transit.`);
      fetchData();
    } catch (err) {
      error("Error", err.response?.data?.message || "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading your shipments..." />;

  // Stats
  const total = shipments.length;
  const pending = shipments.filter(s => ["PENDING", "SCHEDULED", "ASSIGNED"].includes(s.status)).length;
  const inTransit = shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length;
  const completed = shipments.filter(s => s.status === "DELIVERED").length;

  // Filter
  const filtered = shipments.filter(s => {
    const matchSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Shipments</h2>
        <p className="text-xs text-slate-500 mt-0.5">View and manage all shipments assigned to you.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Assigned", value: total, icon: Package, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Pending", value: pending, icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "In Transit", value: inTransit, icon: Truck, bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Completed", value: completed, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Shipment ID or Customer..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s === "ALL" ? "All Statuses" : formatStatus(s)}</option>
          ))}
        </select>
        <button onClick={fetchData} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No shipments found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Shipment ID", "Customer", "Pickup", "Delivery", "Weight", "Priority", "Exp. Date", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[11px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{s.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[120px] truncate">{s.customerName || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate" title={s.pickupAddress}>{s.pickupAddress}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate" title={s.deliveryAddress}>{s.deliveryAddress}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatWeight(s.weightKg)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${s.priority === "URGENT" ? "bg-red-50 text-red-700" : s.priority === "HIGH" ? "bg-orange-50 text-orange-700" : s.priority === "LOW" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600"}`}>
                        {s.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(s.expectedDeliveryDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${getStatusColor(s.status)}`}>
                        {formatStatus(s.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => openDetails(s)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {getDriverAllowedTransitions(s.status).includes("IN_TRANSIT") && (
                          <button
                            onClick={() => handleStartDelivery(s)}
                            disabled={updatingId === s.id}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors disabled:opacity-50"
                            title="Start Delivery"
                          >
                            {updatingId === s.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => navigate("/driver/update-status")}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                          title="Update Status"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate("/driver/route")}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          title="View Route"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{filtered.length} results • Page {page} of {totalPages}</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-slate-900">Shipment Details</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedShipment.id}</p>
              </div>
              <button onClick={() => setSelectedShipment(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Status */}
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedShipment.status)}`}>
                  {formatStatus(selectedShipment.status)}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedShipment.priority === "URGENT" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {selectedShipment.priority}
                </span>
              </div>

              {/* Two-col info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <InfoRow icon={User} label="Customer" value={selectedShipment.customerName} />
                <InfoRow icon={Calendar} label="Expected Delivery" value={formatDate(selectedShipment.expectedDeliveryDate)} />
                <InfoRow icon={MapPin} label="Pickup Address" value={selectedShipment.pickupAddress} />
                <InfoRow icon={MapPin} label="Delivery Address" value={selectedShipment.deliveryAddress} />
                <InfoRow icon={FileText} label="Package" value={selectedShipment.packageDescription} />
                <InfoRow icon={Weight} label="Weight / Volume" value={`${formatWeight(selectedShipment.weightKg)} / ${formatVolume(selectedShipment.volumeM3)}`} />
              </div>
              {selectedShipment.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <span className="font-semibold">Notes: </span>{selectedShipment.notes}
                </div>
              )}

              {/* Status History */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" /><span>Status History</span>
                </h4>
                {historyLoading ? (
                  <div className="p-4 text-center text-xs text-slate-400">Loading history...</div>
                ) : history.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No history available.</div>
                ) : (
                  <div className="space-y-2">
                    {history.map((h, i) => (
                      <div key={i} className="flex items-start space-x-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-700">{formatStatus(h.toStatus)}</span>
                          {h.remarks && <span className="text-slate-400"> — {h.remarks}</span>}
                          <p className="text-slate-400 text-[11px]">{formatDate(h.timestamp)} · by {h.updatedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
                {getDriverAllowedTransitions(selectedShipment.status).length > 0 && (
                  <button
                    onClick={() => { setSelectedShipment(null); navigate("/driver/update-status"); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Update Status
                  </button>
                )}
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start space-x-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}
