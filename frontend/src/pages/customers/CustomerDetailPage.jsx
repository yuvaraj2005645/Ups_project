import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Package,
  Plus,
  CreditCard,
  CheckCircle2
} from "lucide-react";
import { customerService } from "../../services/customerService";
import { shipmentService } from "../../services/shipmentService";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Breadcrumb } from "../../components/Breadcrumb";
import { useToast } from "../../components/Toast";
export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();
  const [customer, setCustomer] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchCustomerData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, sList] = await Promise.all([
        customerService.getById(id),
        shipmentService.getAll({ search: id }).catch(() => [])
      ]);
      setCustomer(c);
      setShipments(sList.filter((s) => s.customerId === id || s.customerName === c.name));
    } catch (err) {
      console.error(err);
      error("Error", "Failed to load customer profile");
    } finally {
      setLoading(false);
    }
  }, [id, error]);
  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);
  if (loading && !customer) {
    return <LoadingSpinner fullPage message="Loading customer account details..." />;
  }
  if (!customer) {
    return <div className="p-8 text-center space-y-4"><p className="text-slate-600">Customer account not found.</p><button
      onClick={() => navigate("/customers")}
      className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
    >
          Back to Customers
        </button></div>;
  }
  const activeShipments = shipments.filter(
    (s) => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY" || s.status === "ASSIGNED"
  ).length;
  return <div className="space-y-6 max-w-5xl mx-auto"><Breadcrumb
    items={[
      { label: "Customers", path: "/customers" },
      { label: customer.name }
    ]}
  />{
    /* Header bar */
  }<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="flex items-center space-x-3"><button
    onClick={() => navigate("/customers")}
    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
  ><ArrowLeft className="w-5 h-5" /></button><div className="flex items-center space-x-3"><div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">{customer.name.charAt(0)}</div><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">{customer.name}</h2><p className="text-xs text-slate-500 mt-0.5">{customer.companyName ? `${customer.companyName} &bull; ` : ""}{customer.city}, {customer.state}</p></div></div></div><button
    onClick={() => navigate(`/shipments/new?customerId=${customer.id}`)}
    className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
  ><Plus className="w-4 h-4 mr-1.5" />
          Book New Shipment
        </button></div>{
    /* Stat Cards */
  }<div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-blue-50 text-primary"><Package className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-slate-900">{shipments.length}</h3><p className="text-xs text-slate-400 mt-0.5">Total Orders Placed</p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-indigo-50 text-indigo-600"><CheckCircle2 className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-slate-900">{activeShipments}</h3><p className="text-xs text-slate-400 mt-0.5">Currently Active Shipments</p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CreditCard className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-emerald-700 font-mono">
              ₹{(customer.totalSpent || 0).toLocaleString()}</h3><p className="text-xs text-slate-400 mt-0.5">Lifetime Billing Revenue</p></div></div></div>{
    /* Customer Profile & Address Card */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><Building2 className="w-4 h-4 text-primary" /><span>Billing Profile & Contact Data</span></h3><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"><div className="p-3 bg-slate-50 rounded-xl"><span className="text-slate-400 block mb-1">Email Address</span><span className="font-semibold text-slate-800">{customer.email}</span></div><div className="p-3 bg-slate-50 rounded-xl"><span className="text-slate-400 block mb-1">Phone Number</span><span className="font-semibold text-slate-800">{customer.phone}</span></div><div className="p-3 bg-slate-50 rounded-xl"><span className="text-slate-400 block mb-1">Commercial Organization</span><span className="font-semibold text-slate-800">{customer.companyName || "N/A"}</span></div><div className="sm:col-span-3 p-3 bg-slate-50 rounded-xl"><span className="text-slate-400 block mb-1">Full Shipping Address</span><span className="font-semibold text-slate-800">{customer.address}, {customer.city}, {customer.state} - {customer.postalCode || "600001"}</span></div></div></div>{
    /* Shipments History Table */
  }<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">
            Consignment History ({shipments.length})
          </h3></div><div className="divide-y divide-slate-100">{shipments.length > 0 ? shipments.map((s) => <div
    key={s.id}
    onClick={() => navigate(`/shipments/${s.id}`)}
    className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
  ><div><div className="flex items-center space-x-2"><span className="font-bold text-xs text-primary font-mono">
                      #{s.id.slice(-6).toUpperCase()}</span><span className="text-xs font-semibold text-slate-800">{s.packageDescription}</span><StatusBadge status={s.status} /></div><p className="text-xs text-slate-400 mt-0.5">{s.pickupAddress} &rarr; {s.deliveryAddress}</p></div><div className="text-right"><span className="text-xs font-bold text-slate-700">{s.weightKg} kg</span><span className="block text-[11px] text-slate-400">{s.expectedDeliveryDate ? new Date(s.expectedDeliveryDate).toLocaleDateString() : ""}</span></div></div>) : <div className="p-8 text-center text-xs text-slate-400">
              No shipments found for this customer account.
            </div>}</div></div></div>;
};
