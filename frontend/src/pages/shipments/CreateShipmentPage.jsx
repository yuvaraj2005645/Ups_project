import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Package, MapPin, User, Calendar } from "lucide-react";
import { shipmentService } from "../../services/shipmentService";
import { customerService } from "../../services/customerService";
import { warehouseService } from "../../services/warehouseService";
import { useToast } from "../../components/Toast";
import { Breadcrumb } from "../../components/Breadcrumb";
const shipmentSchema = z.object({
  customerId: z.string().min(1, "Please select or enter a customer"),
  customerName: z.string().min(1, "Customer name is required"),
  packageDescription: z.string().min(2, "Description must be at least 2 characters"),
  weightKg: z.number().min(0.1, "Weight must be greater than 0"),
  volumeM3: z.number().min(0.01, "Volume must be greater than 0"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  pickupAddress: z.string().min(3, "Pickup address is required"),
  pickupLat: z.number(),
  pickupLng: z.number(),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
  deliveryLat: z.number(),
  deliveryLng: z.number(),
  priority: z.enum(["LOW", "STANDARD", "HIGH", "URGENT"]),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  warehouseId: z.string().optional(),
  notes: z.string().optional()
});
export const CreateShipmentPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      customerId: "",
      customerName: "",
      packageDescription: "",
      weightKg: 10,
      volumeM3: 0.5,
      quantity: 1,
      pickupAddress: "Chennai Port Logistics Hub, Chennai, Tamil Nadu",
      pickupLat: 13.0827,
      pickupLng: 80.2707,
      deliveryAddress: "",
      deliveryLat: 12.9716,
      deliveryLng: 77.5946,
      priority: "STANDARD",
      expectedDeliveryDate: new Date(Date.now() + 864e5 * 2).toISOString().split("T")[0],
      warehouseId: "",
      notes: ""
    }
  });
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [cList, wList] = await Promise.all([
          customerService.getAll().catch(() => []),
          warehouseService.getAll().catch(() => [])
        ]);
        setCustomers(cList || []);
        setWarehouses(wList || []);
      } catch (err) {
        console.error("Error fetching prerequisites:", err);
      }
    };
    loadPrerequisites();
  }, []);
  const handleCustomerChange = (e) => {
    const selectedId = e.target.value;
    const selected = customers.find((c) => c.id === selectedId);
    if (selected) {
      setValue("customerId", selected.id);
      setValue("customerName", selected.name);
      setValue("deliveryAddress", `${selected.address}, ${selected.city}, ${selected.state}`);
    } else {
      setValue("customerId", selectedId);
    }
  };
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const created = await shipmentService.create({
        ...data,
        status: "PENDING"
      });
      success("Shipment Created", `Shipment #${created.id?.slice(-6).toUpperCase() || ""} created successfully!`);
      navigate(`/shipments/${created.id}`);
    } catch (err) {
      console.error(err);
      error("Creation failed", err.response?.data?.message || "Failed to create shipment.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="space-y-6 max-w-5xl mx-auto"><Breadcrumb
    items={[
      { label: "Shipments", path: "/shipments" },
      { label: "Create Shipment" }
    ]}
  /><div className="flex items-center justify-between"><div className="flex items-center space-x-3"><button
    type="button"
    onClick={() => navigate("/shipments")}
    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
  ><ArrowLeft className="w-5 h-5" /></button><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Shipment</h2><p className="text-xs text-slate-500">
              Submit parcel details, weight, volume, pickup, and delivery destinations.
            </p></div></div></div><form onSubmit={handleSubmit(onSubmit)} className="space-y-6">{
    /* Section 1: Customer Info */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100"><User className="w-4 h-4 text-primary" /><span>1. Customer Details</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Registered Customer
              </label><select
    onChange={handleCustomerChange}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  ><option value="">-- Choose Existing Customer (Optional) --</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.city})
                  </option>)}</select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer Name <span className="text-rose-500">*</span></label><input
    type="text"
    {...register("customerName")}
    placeholder="Enter customer full name or enterprise"
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  />{errors.customerName && <p className="text-xs text-rose-500 mt-1">{errors.customerName.message}</p>}</div></div></div>{
    /* Section 2: Package Specifications */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100"><Package className="w-4 h-4 text-primary" /><span>2. Package & Payload Specifications</span></div><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="md:col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Package Description <span className="text-rose-500">*</span></label><input
    type="text"
    {...register("packageDescription")}
    placeholder="e.g. Industrial Machinery Spare Parts"
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  />{errors.packageDescription && <p className="text-xs text-rose-500 mt-1">{errors.packageDescription.message}</p>}</div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Weight (Kg) <span className="text-rose-500">*</span></label><input
    type="number"
    step="0.1"
    {...register("weightKg", { valueAsNumber: true })}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  />{errors.weightKg && <p className="text-xs text-rose-500 mt-1">{errors.weightKg.message}</p>}</div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Volume (m&sup3;) <span className="text-rose-500">*</span></label><input
    type="number"
    step="0.01"
    {...register("volumeM3", { valueAsNumber: true })}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  />{errors.volumeM3 && <p className="text-xs text-rose-500 mt-1">{errors.volumeM3.message}</p>}</div></div></div>{
    /* Section 3: Addresses & Coordinates */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100"><MapPin className="w-4 h-4 text-primary" /><span>3. Origin & Destination Addresses</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{
    /* Pickup */
  }<div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-100"><h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pickup Location
              </h4><div><label className="block text-xs font-semibold text-slate-700 mb-1">Address</label><textarea
    rows={2}
    {...register("pickupAddress")}
    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
  /></div><div className="grid grid-cols-2 gap-2"><div><label className="block text-[11px] text-slate-500">Latitude</label><input
    type="number"
    step="0.0001"
    {...register("pickupLat", { valueAsNumber: true })}
    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
  /></div><div><label className="block text-[11px] text-slate-500">Longitude</label><input
    type="number"
    step="0.0001"
    {...register("pickupLng", { valueAsNumber: true })}
    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
  /></div></div></div>{
    /* Delivery */
  }<div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-100"><h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Delivery Location
              </h4><div><label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Address
                </label><textarea
    rows={2}
    {...register("deliveryAddress")}
    placeholder="Street, City, Pincode"
    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
  />{errors.deliveryAddress && <p className="text-xs text-rose-500 mt-1">{errors.deliveryAddress.message}</p>}</div><div className="grid grid-cols-2 gap-2"><div><label className="block text-[11px] text-slate-500">Latitude</label><input
    type="number"
    step="0.0001"
    {...register("deliveryLat", { valueAsNumber: true })}
    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
  /></div><div><label className="block text-[11px] text-slate-500">Longitude</label><input
    type="number"
    step="0.0001"
    {...register("deliveryLng", { valueAsNumber: true })}
    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
  /></div></div></div></div></div>{
    /* Section 4: Operational Settings */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100"><Calendar className="w-4 h-4 text-primary" /><span>4. Logistics Settings & Timeline</span></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Priority Level
              </label><select
    {...register("priority")}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  ><option value="LOW">Low</option><option value="STANDARD">Standard</option><option value="HIGH">High</option><option value="URGENT">Urgent (Express)</option></select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expected Delivery Date <span className="text-rose-500">*</span></label><input
    type="date"
    {...register("expectedDeliveryDate")}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  />{errors.expectedDeliveryDate && <p className="text-xs text-rose-500 mt-1">{errors.expectedDeliveryDate.message}</p>}</div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fulfillment Warehouse
              </label><select
    {...register("warehouseId")}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  ><option value="">-- Choose Warehouse --</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.city})
                  </option>)}</select></div><div className="md:col-span-3"><label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Handling Notes & Instructions
              </label><textarea
    rows={2}
    {...register("notes")}
    placeholder="Special handling instructions, fragile tags, gate access codes..."
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
  /></div></div></div>{
    /* Submit Actions */
  }<div className="flex items-center justify-end space-x-3 pt-2"><button
    type="button"
    onClick={() => navigate("/shipments")}
    className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
  >
            Cancel
          </button><button
    type="submit"
    disabled={isSubmitting}
    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
  >{isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /><span>Save & Create Shipment</span></>}</button></div></form></div>;
};
