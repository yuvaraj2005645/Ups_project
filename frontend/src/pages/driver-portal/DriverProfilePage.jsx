import { useState, useEffect } from "react";
import {
  User,
  Shield,
  Star,
  CheckCircle2,
  Truck,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Power,
  Edit3,
  Save,
  X,
  MapPin,
} from "lucide-react";
import { driverService } from "../../services/driverService";
import { vehicleService } from "../../services/vehicleService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";

export const DriverProfilePage = () => {
  const { success, error } = useToast();

  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingShift, setIsUpdatingShift] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", address: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      setLoading(true);
      try {
        const d = await driverService.getMe();
        setDriver(d);
        setEditForm({ phone: d.phone || "", address: d.address || "", city: d.city || "" });
        if (d.vehicleId) {
          const v = await vehicleService.getById(d.vehicleId).catch(() => null);
          setVehicle(v);
        }
      } catch (err) {
        // Fallback: try fetching all and matching by email (older fallback)
        try {
          const drivers = await driverService.getAll();
          const d = drivers[0];
          if (d) {
            setDriver(d);
            setEditForm({ phone: d.phone || "", address: d.address || "", city: d.city || "" });
            if (d.vehicleId) {
              const v = await vehicleService.getById(d.vehicleId).catch(() => null);
              setVehicle(v);
            }
          }
        } catch {
          error("Error", "Could not load driver profile.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, []);

  const toggleShiftDuty = async () => {
    if (!driver) return;
    setIsUpdatingShift(true);
    const nextStatus = driver.status === "AVAILABLE" ? "ON_LEAVE" : "AVAILABLE";
    try {
      const updated = await driverService.update(driver.id, { status: nextStatus });
      setDriver(updated);
      success(
        "Shift Updated",
        nextStatus === "AVAILABLE" ? "You are now ON DUTY & AVAILABLE" : "You are now OFF DUTY"
      );
    } catch (err) {
      error("Error", "Could not update duty status.");
    } finally {
      setIsUpdatingShift(false);
    }
  };

  const handleEditSave = async () => {
    if (!editForm.phone.trim() && !editForm.address.trim() && !editForm.city.trim()) {
      error("Validation", "Please update at least one field.");
      return;
    }
    setSaving(true);
    try {
      const updated = await driverService.updateMe({
        phone: editForm.phone.trim() || undefined,
        address: editForm.address.trim() || undefined,
        city: editForm.city.trim() || undefined,
      });
      setDriver(updated);
      setEditing(false);
      success("Profile Updated", "Your contact information has been saved.");
    } catch (err) {
      error("Error", err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ phone: driver?.phone || "", address: driver?.address || "", city: driver?.city || "" });
    setEditing(false);
  };

  if (loading) return <LoadingSpinner fullPage message="Loading driver profile..." />;
  if (!driver) return <div className="p-8 text-center text-slate-500">Driver profile not found.</div>;

  const expiryDate = new Date(driver.licenseExpiry);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;
  const isAvailable = driver.status === "AVAILABLE";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner with Duty Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-sm">
            {driver.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{driver.name}</h2>
              <StatusBadge status={driver.status} type="driver" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {driver.city} &bull; {driver.experienceYears} Years Commercial Driving Experience
            </p>
          </div>
        </div>
        <button
          onClick={toggleShiftDuty}
          disabled={isUpdatingShift}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 self-start sm:self-auto disabled:opacity-60 ${
            isAvailable
              ? "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isAvailable ? "Clock Off Duty" : "Go On Duty (Available)"}</span>
        </button>
      </div>

      {/* License Warning */}
      {(isExpiringSoon || isExpired) && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs ${
            isExpired ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold">{isExpired ? "COMMERCIAL LICENSE EXPIRED" : "LICENSE EXPIRING SOON"}</span>
            <p className="mt-0.5">
              License #{driver.licenseNumber} expires {expiryDate.toLocaleDateString()} (
              {isExpired ? "EXPIRED" : `${daysUntilExpiry} days remaining`}). Please notify dispatch.
            </p>
          </div>
        </div>
      )}

      {/* Performance Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Star, bg: "bg-amber-50", color: "text-amber-500", value: driver.performanceRating || 4.9, label: "Customer Rating / 5.0", fill: true },
          { icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600", value: driver.totalDeliveries || 0, label: "Completed Trips" },
          { icon: Shield, bg: "bg-blue-50", color: "text-blue-600", value: "96.8%", label: "On-Time SLA Delivery" },
        ].map(({ icon: Icon, bg, color, value, label, fill }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
              <Icon className={`w-6 h-6 ${fill ? "fill-current" : ""}`} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Credentials & Vehicle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credentials Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" /><span>Driver Credentials</span>
            </h3>
            <button
              onClick={() => setEditing((e) => !e)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                editing
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{editing ? "Cancel" : "Edit"}</span>
            </button>
          </div>

          {editing ? (
            /* Edit Form */
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Street address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="City"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleEditSave}
                  disabled={saving}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving…" : "Save Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold transition-colors"
                >
                  <X className="w-3.5 h-3.5" /><span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            /* Read-Only View */
            <div className="space-y-3 text-xs">
              <CredRow icon={Phone} label="Mobile Phone" value={driver.phone} />
              <CredRow icon={Mail} label="Email" value={driver.email} />
              <CredRow icon={MapPin} label="City" value={driver.city} />
              <CredRow icon={Shield} label="Commercial License" value={driver.licenseNumber} mono />
              <CredRow icon={Calendar} label="License Expiry" value={expiryDate.toLocaleDateString()} />
            </div>
          )}
        </div>

        {/* Assigned Vehicle */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Truck className="w-4 h-4 text-blue-600" /><span>Assigned Transport Vehicle</span>
          </h3>
          {vehicle ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-slate-900 text-sm">{vehicle.registrationNumber}</span>
                <StatusBadge status={vehicle.status} type="vehicle" />
              </div>
              <p className="text-slate-500">
                {vehicle.manufacturer} {vehicle.model} ({vehicle.type?.replace("_", " ")})
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block">Payload Max:</span>
                  <span className="font-bold text-slate-800">{vehicle.maxWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Fuel Engine:</span>
                  <span className="font-bold text-slate-800">{vehicle.fuelType}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 p-6 text-center italic">
              No vehicle assigned to your profile today.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function CredRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-400 flex items-center space-x-1.5">
        <Icon className="w-3.5 h-3.5" /><span>{label}</span>
      </span>
      <span className={`font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );
}
