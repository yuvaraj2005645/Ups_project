import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  MapPin,
  FileCheck,
  Send
} from "lucide-react";
import { deliveryService } from "../../services/deliveryService";
import { shipmentService } from "../../services/shipmentService";
import { driverService } from "../../services/driverService";
import { vehicleService } from "../../services/vehicleService";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Breadcrumb } from "../../components/Breadcrumb";
import { useToast } from "../../components/Toast";
export const DeliveryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [delivery, setDelivery] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("SCHEDULED");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const fetchDeliveryData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await deliveryService.getById(id);
      setDelivery(d);
      setNewStatus(d.status);
      setNotes(d.remarks || "");
      const [s, dr, v] = await Promise.all([
        d.shipmentId ? shipmentService.getById(d.shipmentId).catch(() => null) : null,
        d.driverId ? driverService.getById(d.driverId).catch(() => null) : null,
        d.vehicleId ? vehicleService.getById(d.vehicleId).catch(() => null) : null
      ]);
      setShipment(s);
      setDriver(dr);
      setVehicle(v);
    } catch (err) {
      console.error(err);
      error("Error", "Failed to load delivery record");
    } finally {
      setLoading(false);
    }
  }, [id, error]);
  useEffect(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!id) return;
    setIsUpdating(true);
    try {
      const updated = await deliveryService.updateStatus(id, newStatus, notes);
      setDelivery(updated);
      success("Delivery Updated", `Status changed to ${newStatus}`);
    } catch (err) {
      error("Update failed", err.response?.data?.message || "Could not update delivery status");
    } finally {
      setIsUpdating(false);
    }
  };
  if (loading && !delivery) {
    return <LoadingSpinner fullPage message="Loading delivery dispatch verification..." />;
  }
  if (!delivery) {
    return <div className="p-8 text-center space-y-4"><p className="text-slate-600">Delivery record not found.</p><button
      onClick={() => navigate("/deliveries")}
      className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
    >
          Back to Deliveries
        </button></div>;
  }
  return <div className="space-y-6 max-w-5xl mx-auto"><Breadcrumb
    items={[
      { label: "Deliveries", path: "/deliveries" },
      { label: `#${delivery.id.slice(-6).toUpperCase()}` }
    ]}
  />{
    /* Header bar */
  }<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="flex items-center space-x-3"><button
    onClick={() => navigate("/deliveries")}
    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
  ><ArrowLeft className="w-5 h-5" /></button><div><div className="flex items-center space-x-3"><h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Delivery #{delivery.id.slice(-6).toUpperCase()}</h2><StatusBadge status={delivery.status} type="delivery" /></div><p className="text-xs text-slate-500 mt-0.5">
              Scheduled Date: {delivery.scheduledDate} &bull; Destination: {delivery.destinationCity}</p></div></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{
    /* Left Column: Proof of Delivery & Details */
  }<div className="lg:col-span-2 space-y-6">{
    /* Main Delivery Destination */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><MapPin className="w-4 h-4 text-primary" /><span>Destination Coordinates & Timing</span></h3><div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"><p className="text-xs font-bold text-slate-800">{delivery.destinationAddress}</p><p className="text-xs text-slate-500">{delivery.destinationCity}</p><div className="flex items-center space-x-4 pt-2 text-xs text-slate-600"><span><strong className="text-slate-700">Scheduled:</strong> {delivery.scheduledDate}</span>{delivery.deliveryDate && <span><strong className="text-slate-700">Delivered:</strong>{" "}{new Date(delivery.deliveryDate).toLocaleString()}</span>}</div></div></div>{
    /* Proof of Delivery (POD) Panel */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><FileCheck className="w-4 h-4 text-emerald-600" /><span>Electronic Proof of Delivery (e-POD)</span></h3>{delivery.proofOfDelivery?.signatureUrl || delivery.receiverName ? <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-4"><div className="grid grid-cols-2 gap-4 text-xs"><div><span className="text-slate-500">Receiver Name:</span><p className="text-sm font-bold text-slate-900 mt-0.5">{delivery.receiverName}</p></div><div><span className="text-slate-500">Delivered Timestamp:</span><p className="text-xs font-semibold text-slate-800 mt-0.5">{delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleString() : "Recorded on device"}</p></div></div>{delivery.proofOfDelivery?.signatureUrl && <div><span className="text-xs text-slate-500 block mb-1.5 font-medium">
                        Customer Signature Verification
                      </span><div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-sm"><img
    src={delivery.proofOfDelivery.signatureUrl}
    alt="Customer Signature"
    className="max-h-24 object-contain"
  /></div></div>}{delivery.remarks && <div className="pt-2 border-t border-emerald-100 text-xs"><span className="text-slate-500 font-medium">Delivery Notes / Remarks:</span><p className="text-slate-800 mt-0.5 italic">"{delivery.remarks}"</p></div>}</div> : <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Proof of delivery not yet submitted. Awaiting driver app signature capture upon recipient arrival.
              </div>}</div>{
    /* Linked Shipment Details */
  }{shipment && <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center justify-between pb-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><Package className="w-4 h-4 text-primary" /><span>Linked Consignment Package</span></h3><Link
    to={`/shipments/${shipment.id}`}
    className="text-xs font-semibold text-primary hover:underline"
  >
                  View Full Shipment &rarr;
                </Link></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs"><div><span className="text-slate-400 block mb-0.5">Customer</span><span className="font-semibold text-slate-800">{shipment.customerName}</span></div><div><span className="text-slate-400 block mb-0.5">Weight</span><span className="font-semibold text-slate-800">{shipment.weightKg} kg</span></div><div><span className="text-slate-400 block mb-0.5">Volume</span><span className="font-semibold text-slate-800">{shipment.volumeM3} m&sup3;</span></div><div><span className="text-slate-400 block mb-0.5">Priority</span><span className="font-semibold text-slate-800">{shipment.priority}</span></div></div></div>}</div>{
    /* Right Column: Status Update & Personnel */
  }<div className="space-y-6">{
    /* Status Update Form */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-primary" /><span>Update Dispatch State</span></h3><form onSubmit={handleUpdateStatus} className="space-y-3"><div><label className="block text-xs font-semibold text-slate-700 mb-1">Status</label><select
    value={newStatus}
    onChange={(e) => setNewStatus(e.target.value)}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
  ><option value="SCHEDULED">Scheduled</option><option value="OUT_FOR_DELIVERY">Out For Delivery</option><option value="DELIVERED">Delivered</option><option value="FAILED_DELIVERY">Failed Delivery</option><option value="CANCELLED">Cancelled</option></select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dispatch Notes
                </label><textarea
    rows={2}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="Gate code, recipient instructions, reason for delay..."
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
  /></div><button
    type="submit"
    disabled={isUpdating}
    className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
  >{isUpdating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-3.5 h-3.5" /><span>Apply Dispatch Status</span></>}</button></form></div>{
    /* Assigned Driver & Vehicle */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900">Personnel & Carrier Asset</h3><div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Carrier Driver
              </p>{driver ? <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3"><div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{driver.name.charAt(0)}</div><div><p className="font-bold text-xs text-slate-900">{driver.name}</p><p className="text-[11px] text-slate-500">{driver.phone}</p></div></div> : <p className="text-xs text-slate-400 italic">No driver assigned.</p>}</div><div className="pt-2 border-t border-slate-100"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Transport Vehicle
              </p>{vehicle ? <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="font-mono font-bold text-xs text-slate-900">{vehicle.registrationNumber}</p><p className="text-[11px] text-slate-500">{vehicle.manufacturer} {vehicle.model} ({vehicle.type?.replace("_", " ")})
                  </p></div> : <p className="text-xs text-slate-400 italic">No vehicle assigned.</p>}</div></div></div></div></div>;
};
