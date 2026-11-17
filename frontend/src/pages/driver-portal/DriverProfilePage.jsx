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
  Power
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { driverService } from "../../services/driverService";
import { vehicleService } from "../../services/vehicleService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
export const DriverProfilePage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingShift, setIsUpdatingShift] = useState(false);
  useEffect(() => {
    const fetchDriver = async () => {
      setLoading(true);
      try {
        const drivers = await driverService.getAll();
        const currentDriver = drivers.find((d) => d.email === user?.email || d.name === user?.name) || drivers[0];
        if (currentDriver) {
          setDriver(currentDriver);
          if (currentDriver.vehicleId) {
            const v = await vehicleService.getById(currentDriver.vehicleId).catch(() => null);
            setVehicle(v);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [user]);
  const toggleShiftDuty = async () => {
    if (!driver) return;
    setIsUpdatingShift(true);
    const nextStatus = driver.status === "AVAILABLE" ? "ON_LEAVE" : "AVAILABLE";
    try {
      const updated = await driverService.update(driver.id, {
        status: nextStatus
      });
      setDriver(updated);
      success(
        "Shift Updated",
        nextStatus === "AVAILABLE" ? "You are now ON DUTY & AVAILABLE" : "You are now OFF DUTY"
      );
    } catch (err) {
      error("Error", "Could not update duty status");
    } finally {
      setIsUpdatingShift(false);
    }
  };
  if (loading) {
    return <LoadingSpinner fullPage message="Loading driver profile..." />;
  }
  if (!driver) {
    return <div className="p-8 text-center text-slate-500">Driver identity profile not found.</div>;
  }
  const expiryDate = new Date(driver.licenseExpiry);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;
  const isAvailable = driver.status === "AVAILABLE";
  return <div className="space-y-6 max-w-4xl mx-auto">{
    /* Top Banner with Duty Toggle */
  }<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="flex items-center space-x-4"><div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">{driver.name.charAt(0)}</div><div><div className="flex items-center space-x-2"><h2 className="text-xl font-bold text-slate-900 tracking-tight">{driver.name}</h2><StatusBadge status={driver.status} type="driver" /></div><p className="text-xs text-slate-500 mt-0.5">{driver.city} &bull; {driver.experienceYears} Years Commercial Driving Experience
            </p></div></div><button
    onClick={toggleShiftDuty}
    disabled={isUpdatingShift}
    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 self-start sm:self-auto ${isAvailable ? "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"}`}
  ><Power className="w-4 h-4" /><span>{isAvailable ? "Clock Off Duty" : "Go On Duty (Available)"}</span></button></div>{
    /* License Warning if needed */
  }{(isExpiringSoon || isExpired) && <div
    className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs ${isExpired ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}
  ><AlertTriangle className="w-5 h-5 shrink-0" /><div><span className="font-bold">{isExpired ? "COMMERCIAL LICENSE EXPIRED" : "LICENSE EXPIRING SOON"}</span><p className="mt-0.5">
              License #{driver.licenseNumber} expires {expiryDate.toLocaleDateString()} (
              {daysUntilExpiry} days remaining). Please notify dispatch operations.
            </p></div></div>}{
    /* Driver Scorecards */
  }<div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-amber-50 text-amber-500"><Star className="w-6 h-6 fill-current" /></div><div><h3 className="text-2xl font-bold text-slate-900">{driver.performanceRating || 4.9}</h3><p className="text-xs text-slate-400 mt-0.5">Customer Rating / 5.0</p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-slate-900">{driver.totalDeliveries || 0}</h3><p className="text-xs text-slate-400 mt-0.5">Completed Trips</p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-blue-50 text-primary"><Shield className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-slate-900">96.8%</h3><p className="text-xs text-slate-400 mt-0.5">On-Time SLA Delivery</p></div></div></div>{
    /* Driver Coordinates & Assigned Vehicle */
  }<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{
    /* Credentials */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100"><User className="w-4 h-4 text-primary" /><span>Driver Credentials</span></h3><div className="space-y-3 text-xs"><div className="flex justify-between items-center py-1.5 border-b border-slate-100"><span className="text-slate-400 flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5" /> Mobile Phone
              </span><span className="font-semibold text-slate-800">{driver.phone}</span></div><div className="flex justify-between items-center py-1.5 border-b border-slate-100"><span className="text-slate-400 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5" /> Email
              </span><span className="font-semibold text-slate-800">{driver.email}</span></div><div className="flex justify-between items-center py-1.5 border-b border-slate-100"><span className="text-slate-400 flex items-center"><Shield className="w-3.5 h-3.5 mr-1.5" /> Commercial License
              </span><span className="font-mono font-semibold text-slate-800">{driver.licenseNumber}</span></div><div className="flex justify-between items-center py-1.5"><span className="text-slate-400 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" /> License Expiry
              </span><span className="font-semibold text-slate-800">{expiryDate.toLocaleDateString()}</span></div></div></div>{
    /* Assigned Vehicle */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100"><Truck className="w-4 h-4 text-primary" /><span>Assigned Transport Vehicle</span></h3>{vehicle ? <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs"><div className="flex justify-between items-center"><span className="font-mono font-bold text-slate-900 text-sm">{vehicle.registrationNumber}</span><StatusBadge status={vehicle.status} type="vehicle" /></div><p className="text-slate-500">{vehicle.manufacturer} {vehicle.model} ({vehicle.type?.replace("_", " ")})
              </p><div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-600"><div><span className="text-slate-400 block">Payload Max:</span><span className="font-bold text-slate-800">{vehicle.maxWeightKg} kg</span></div><div><span className="text-slate-400 block">Fuel Engine:</span><span className="font-bold text-slate-800">{vehicle.fuelType}</span></div></div></div> : <p className="text-xs text-slate-400 p-6 text-center italic">
              No vehicle assigned to your profile today.
            </p>}</div></div></div>;
};
