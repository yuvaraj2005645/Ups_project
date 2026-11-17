import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  User,
  Weight,
} from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
import { customerService } from "../../services/customerService";
import { driverService } from "../../services/driverService";
import { shipmentService } from "../../services/shipmentService";
import { vehicleService } from "../../services/vehicleService";
import {
  formatDate,
  formatDateTime,
  formatStatus,
  formatWeight,
  getDriverAllowedTransitions,
  getStatusColor,
} from "../../utils/formatters";

const STATUS_STEPS = [
  "PENDING",
  "SCHEDULED",
  "ASSIGNED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];
const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED"];

function getErrorMessage(err, fallback) {
  if (err.response?.status === 401) return "Your session has expired. Sign in again to continue.";
  if (err.response?.status === 403) return "You do not have permission to access these shipments.";
  return err.response?.data?.message || err.message || fallback;
}

function StatusStepper({ status, history }) {
  const progressStatus = STATUS_STEPS.includes(status)
    ? status
    : [...history].reverse().find((item) => STATUS_STEPS.includes(item.toStatus))?.toStatus;
  const progressIndex = STATUS_STEPS.indexOf(progressStatus);

  return (
    <div className="space-y-3">
      <div className="flex items-start overflow-x-auto pb-2">
        {STATUS_STEPS.map((step, index) => {
          const complete = index < progressIndex;
          const current = index === progressIndex;
          return (
            <div key={step} className="flex min-w-[72px] flex-1 items-start last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  complete ? "border-emerald-500 bg-emerald-500 text-white"
                    : current ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-400"
                }`}>
                  {complete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`mt-1 max-w-[72px] text-center text-[10px] font-semibold leading-tight ${
                  current ? "text-blue-700" : complete ? "text-emerald-700" : "text-slate-400"
                }`}>
                  {formatStatus(step)}
                </span>
              </div>
              {index < STATUS_STEPS.length - 1 && (
                <div className={`mt-4 h-0.5 min-w-4 flex-1 ${index < progressIndex ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
      {!STATUS_STEPS.includes(status) && status && (
        <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${getStatusColor(status)}`}>
          <AlertCircle className="h-4 w-4" />
          Current exception status: {formatStatus(status)}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`rounded-xl p-2.5 ${tone}`}><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export const UpdateStatus = () => {
  const { success, error } = useToast();
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState({});
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [detailRefresh, setDetailRefresh] = useState(0);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const driver = await driverService.getMe();
      if (!driver?.id) throw new Error("The driver profile response is missing an ID.");

      const assigned = await driverService.getDriverShipments(driver.id);
      if (!Array.isArray(assigned)) throw new Error("The shipment API returned an invalid response.");

      const customerIds = [...new Set(assigned.map((shipment) => shipment.customerId).filter(Boolean))];
      const vehicleIds = [...new Set(assigned.map((shipment) => shipment.vehicleId).filter(Boolean))];
      const [customerRecords, vehicleRecords] = await Promise.all([
        Promise.all(customerIds.map((id) => customerService.getById(id))),
        Promise.all(vehicleIds.map((id) => vehicleService.getById(id))),
      ]);

      if (customerRecords.some((customer) => !customer?.id) || vehicleRecords.some((vehicle) => !vehicle?.id)) {
        throw new Error("A customer or vehicle detail response was incomplete.");
      }

      setShipments(assigned);
      setCustomers(Object.fromEntries(customerRecords.map((customer) => [customer.id, customer])));
      setVehicles(Object.fromEntries(vehicleRecords.map((vehicle) => [vehicle.id, vehicle])));
      setSelectedId((previous) => (
        previous && assigned.some((shipment) => shipment.id === previous)
          ? previous
          : assigned.find((shipment) => getDriverAllowedTransitions(shipment.status).length > 0)?.id || ""
      ));
    } catch (err) {
      const message = getErrorMessage(err, "Could not load your assigned shipments. Check your connection and retry.");
      setLoadError(message);
      error("Unable to load shipments", message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      setHistory([]);
      setHistoryError("");
      setNewStatus("");
      setRemarks("");
      return undefined;
    }

    let active = true;
    setDetailsLoading(true);
    setHistoryError("");
    setNewStatus("");
    setRemarks("");

    Promise.all([
      shipmentService.getById(selectedId),
      shipmentService.getHistory(selectedId),
    ]).then(([shipment, shipmentHistory]) => {
      if (!active) return;
      if (!shipment?.id || !Array.isArray(shipmentHistory)) {
        throw new Error("The shipment details or history API returned an invalid response.");
      }
      setSelected(shipment);
      setHistory([...shipmentHistory].sort(
        (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
      ));
    }).catch((err) => {
      if (!active) return;
      const message = getErrorMessage(err, "Could not load shipment details and status history.");
      setSelected(null);
      setHistory([]);
      setHistoryError(message);
      error("Unable to load shipment details", message);
    }).finally(() => {
      if (active) setDetailsLoading(false);
    });

    return () => { active = false; };
  }, [selectedId, detailRefresh, error]);

  const actionableShipments = useMemo(
    () => shipments.filter((shipment) => getDriverAllowedTransitions(shipment.status).length > 0),
    [shipments]
  );
  const allowedNext = selected ? getDriverAllowedTransitions(selected.status) : [];
  const inTransit = shipments.filter((shipment) => shipment.status === "IN_TRANSIT").length;
  const outForDelivery = shipments.filter((shipment) => shipment.status === "OUT_FOR_DELIVERY").length;
  const completed = shipments.filter((shipment) => shipment.status === "DELIVERED").length;
  const activeCount = shipments.filter((shipment) => !TERMINAL_STATUSES.includes(shipment.status)).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selected || !newStatus || !allowedNext.includes(newStatus)) {
      error("Invalid status", "Choose one of the valid next statuses for this shipment.");
      return;
    }

    setSubmitting(true);
    try {
      await shipmentService.updateStatus(selected.id, newStatus, remarks.trim() || undefined);
      success("Status updated", `Shipment ${selected.id} is now ${formatStatus(newStatus)}.`);
      await fetchData();
      setDetailRefresh((value) => value + 1);
    } catch (err) {
      error("Status update failed", getErrorMessage(err, "The shipment status could not be updated."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading your assigned shipments..." />;

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader />
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
          <h3 className="font-semibold text-slate-900">Shipment data could not be loaded</h3>
          <p className="mt-2 text-sm text-slate-600">{loadError}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={fetchData} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
            <Link to="/driver/shipments" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              My Shipments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Active Shipments" value={activeCount} icon={Package} tone="bg-blue-50 text-blue-600" />
        <SummaryCard label="In Transit" value={inTransit} icon={Truck} tone="bg-amber-50 text-amber-600" />
        <SummaryCard label="Out for Delivery" value={outForDelivery} icon={MapPin} tone="bg-orange-50 text-orange-600" />
        <SummaryCard label="Completed" value={completed} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
      </div>

      {actionableShipments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h3 className="font-semibold text-slate-800">
            {shipments.length === 0 ? "No shipments are assigned to your driver account" : "No assigned shipments can be updated"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {shipments.length === 0
              ? "Ask your dispatcher to assign a shipment, then retry this page."
              : "Your assigned shipments are completed or do not have a valid next status."}
          </p>
          <Link to="/driver/shipments" className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Return to My Shipments
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Shipments Available for Status Update</h3>
            <p className="mt-1 text-xs text-slate-500">Only shipments assigned to your driver account with a valid next transition are listed.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {actionableShipments.map((shipment) => {
              const customer = customers[shipment.customerId];
              return (
                <article key={shipment.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${selectedId === shipment.id ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-blue-700">{shipment.id}</p>
                      <p className="mt-1 font-semibold text-slate-900">{shipment.customerName || customer?.name || "Customer"}</p>
                    </div>
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${getStatusColor(shipment.status)}`}>{formatStatus(shipment.status)}</span>
                  </div>
                  <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                    <Info icon={Phone} label="Customer Contact" value={customer?.phone || "Not available"} />
                    <Info icon={Package} label="Package" value={shipment.packageDescription || "Not provided"} />
                    <Info icon={MapPin} label="Pickup" value={shipment.pickupAddress || "Not provided"} />
                    <Info icon={MapPin} label="Delivery" value={shipment.deliveryAddress || "Not provided"} />
                    <Info icon={Weight} label="Shipment Weight" value={formatWeight(shipment.weightKg)} />
                    <Info icon={Calendar} label="Expected Delivery" value={formatDate(shipment.expectedDeliveryDate)} />
                    <Info icon={User} label="Priority" value={formatStatus(shipment.priority)} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(shipment.id)}
                    className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    Select Shipment
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {selected && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shipment Details</p>
                  <h3 className="mt-1 font-mono text-lg font-bold text-slate-900">{selected.id}</h3>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${getStatusColor(selected.status)}`}>{formatStatus(selected.status)}</span>
              </div>
              <div className="grid gap-4 text-xs sm:grid-cols-2">
                <Info icon={User} label="Customer" value={selected.customerName || customers[selected.customerId]?.name} />
                <Info icon={Phone} label="Customer Contact" value={customers[selected.customerId]?.phone || "Not available"} />
                <Info icon={MapPin} label="Delivery Address" value={selected.deliveryAddress} />
                <Info icon={Truck} label="Assigned Vehicle" value={vehicles[selected.vehicleId]?.registrationNumber || selected.vehicleId || "Not assigned"} />
                <Info icon={Calendar} label="Expected Delivery" value={formatDate(selected.expectedDeliveryDate)} />
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Delivery Progress</p>
                <StatusStepper status={selected.status} history={history} />
              </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Update Status</h3>
              {allowedNext.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <AlertCircle className="h-4 w-4 shrink-0 text-slate-400" />
                  No further status transitions are allowed from {formatStatus(selected.status)}.
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="shipment-status" className="mb-1.5 block text-xs font-semibold text-slate-700">New Status <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select id="shipment-status" required value={newStatus} onChange={(event) => setNewStatus(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="">Select a valid next status</option>
                        {allowedNext.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    {newStatus && <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><span className={`rounded px-2 py-1 font-semibold ${getStatusColor(selected.status)}`}>{formatStatus(selected.status)}</span><ArrowRight className="h-3.5 w-3.5" /><span className={`rounded px-2 py-1 font-semibold ${getStatusColor(newStatus)}`}>{formatStatus(newStatus)}</span></p>}
                  </div>
                  <div>
                    <label htmlFor="shipment-remarks" className="mb-1.5 block text-xs font-semibold text-slate-700">Delivery Remarks</label>
                    <textarea id="shipment-remarks" rows={3} value={remarks} onChange={(event) => setRemarks(event.target.value)} maxLength={500} placeholder="Add delivery or exception details" className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={submitting || !newStatus} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                      {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {submitting ? "Updating..." : "Update Status"}
                    </button>
                    <button type="button" disabled={submitting} onClick={() => { setNewStatus(""); setRemarks(""); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                  </div>
                </>
              )}
            </form>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-100 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Clock className="h-4 w-4" /> Shipment History</h3>
            </div>
            <div className="max-h-[650px] overflow-y-auto p-4">
              {detailsLoading ? (
                <div className="py-8 text-center text-sm text-slate-500">Loading shipment details and history...</div>
              ) : historyError ? (
                <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{historyError}</div>
              ) : history.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No status history is available for this shipment.</p>
              ) : (
                <ol className="space-y-5">
                  {history.map((item, index) => (
                    <li key={item.id || `${item.timestamp}-${index}`} className="relative border-l border-slate-200 pb-1 pl-5 last:border-0">
                      <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`rounded-md px-2 py-1 font-semibold ${getStatusColor(item.fromStatus)}`}>{formatStatus(item.fromStatus || "CREATED")}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span className={`rounded-md px-2 py-1 font-semibold ${getStatusColor(item.toStatus)}`}>{formatStatus(item.toStatus)}</span>
                      </div>
                      {item.remarks && <p className="mt-2 text-sm text-slate-600">{item.remarks}</p>}
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(item.timestamp)} · Updated by {item.updatedBy || "Unknown"}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

function PageHeader() {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">Update Status</h2>
      <p className="mt-0.5 text-xs text-slate-500">Update the delivery status for your assigned shipments.</p>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 break-words font-medium text-slate-800">{value || "Not provided"}</p>
      </div>
    </div>
  );
}
