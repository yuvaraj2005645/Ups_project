import { useState, useEffect, useCallback } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  MapPin,
  Calendar,
  Image,
  PenTool,
} from "lucide-react";
import { driverService } from "../../services/driverService";
import { deliveryService } from "../../services/deliveryService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
import { formatDate, formatDateTime, formatStatus, getStatusColor } from "../../utils/formatters";

const ITEMS_PER_PAGE = 10;

export const DeliveryHistory = () => {
  const { error } = useToast();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [viewDelivery, setViewDelivery] = useState(null);
  const [viewPod, setViewPod] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const driver = await driverService.getMe();
      const list = await deliveryService.getByDriverId(driver.id);
      // History = ALL deliveries (completed or not)
      setDeliveries(list || []);
    } catch (err) {
      error("Error", err.response?.data?.message || "Failed to load delivery history.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Stats
  const total = deliveries.length;
  const successful = deliveries.filter((d) => d.status === "DELIVERED").length;
  const failed = deliveries.filter((d) => d.status === "FAILED" || d.status === "RETURNED").length;
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  // Filter
  const filtered = deliveries.filter((d) => {
    const matchSearch =
      (d.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.shipmentId || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.receiverName || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.destinationAddress || "").toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;

    const deliveryDate = d.deliveryDate || d.scheduledDate;
    const matchFrom = !dateFrom || (deliveryDate && deliveryDate >= dateFrom);
    const matchTo = !dateTo || (deliveryDate && deliveryDate <= dateTo + "T23:59:59");

    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) return <LoadingSpinner fullPage message="Loading delivery history..." />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Delivery History</h2>
        <p className="text-xs text-slate-500 mt-0.5">Complete record of all your delivery activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Deliveries", value: total, icon: History, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Successful", value: successful, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Failed / Returned", value: failed, icon: XCircle, bg: "bg-red-50", color: "text-red-500" },
          { label: "Success Rate", value: `${successRate}%`, icon: CheckCircle2, bg: "bg-indigo-50", color: "text-indigo-600" },
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, shipment, recipient, address..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="RETURNED">Returned</option>
          </select>

          {/* Date range */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button onClick={fetchHistory} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="p-16 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No delivery records found</p>
            <p className="text-xs text-slate-400 mt-1">Adjust your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Delivery ID", "Shipment ID", "Recipient", "Destination", "Scheduled", "Delivered", "Status", "POD", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[11px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{d.id}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{d.shipmentId || "—"}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{d.receiverName || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate" title={d.destinationAddress}>
                      {d.destinationAddress}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(d.scheduledDate)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {d.deliveryDate ? formatDateTime(d.deliveryDate) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getStatusColor(d.status)}`}>
                        {formatStatus(d.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.signatureBase64 || d.proofPhotoBase64 ? (
                        <span className="text-emerald-600 font-semibold text-[11px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" /><span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setViewDelivery(d)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(d.signatureBase64 || d.proofPhotoBase64) && (
                          <button
                            onClick={() => setViewPod(d)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="View POD"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                          </button>
                        )}
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
            <span className="text-xs text-slate-400">{filtered.length} records · Page {page} of {totalPages}</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Detail Modal */}
      {viewDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-slate-900">Delivery Details</h3>
                <p className="text-xs text-slate-400 font-mono">{viewDelivery.id}</p>
              </div>
              <button onClick={() => setViewDelivery(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(viewDelivery.status)}`}>
                  {formatStatus(viewDelivery.status)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={Package} label="Shipment ID" value={viewDelivery.shipmentId} />
                <InfoItem icon={Calendar} label="Scheduled" value={formatDate(viewDelivery.scheduledDate)} />
                <InfoItem icon={MapPin} label="Destination" value={viewDelivery.destinationAddress} />
                <InfoItem icon={Package} label="City" value={viewDelivery.destinationCity} />
                {viewDelivery.receiverName && (
                  <InfoItem icon={CheckCircle2} label="Received By" value={viewDelivery.receiverName} />
                )}
                {viewDelivery.deliveryDate && (
                  <InfoItem icon={Calendar} label="Delivered At" value={formatDateTime(viewDelivery.deliveryDate)} />
                )}
              </div>
              {viewDelivery.remarks && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 mb-0.5">Remarks</p>
                  <p className="text-slate-700">{viewDelivery.remarks}</p>
                </div>
              )}
              {viewDelivery.failureReason && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-red-500 mb-0.5">Failure Reason</p>
                  <p className="text-red-700">{viewDelivery.failureReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POD Modal */}
      {viewPod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-slate-900">Proof of Delivery</h3>
                <p className="text-xs text-slate-400 font-mono">{viewPod.id}</p>
              </div>
              <button onClick={() => setViewPod(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {viewPod.receiverName && (
                <div className="text-xs">
                  <p className="text-slate-400">Received By</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{viewPod.receiverName}</p>
                </div>
              )}
              {viewPod.signatureBase64 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 flex items-center space-x-1.5">
                    <PenTool className="w-3.5 h-3.5" /><span>Customer Signature</span>
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <img src={viewPod.signatureBase64} alt="Signature" className="max-h-32 object-contain mx-auto" />
                  </div>
                </div>
              )}
              {viewPod.proofPhotoBase64 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 flex items-center space-x-1.5">
                    <Image className="w-3.5 h-3.5" /><span>Delivery Photo</span>
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56">
                    <img src={viewPod.proofPhotoBase64} alt="Proof" className="w-full object-contain max-h-56" />
                  </div>
                </div>
              )}
              {!viewPod.signatureBase64 && !viewPod.proofPhotoBase64 && (
                <p className="text-xs text-slate-400 text-center py-4">No POD assets available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function InfoItem({ icon: Icon, label, value }) {
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
