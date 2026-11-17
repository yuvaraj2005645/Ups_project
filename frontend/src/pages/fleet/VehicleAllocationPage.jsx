import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Cpu,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { vehicleService } from "../../services/vehicleService";
import { ProgressBar } from "../../components/ProgressBar";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Breadcrumb } from "../../components/Breadcrumb";
import { useToast } from "../../components/Toast";
export const VehicleAllocationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();
  const [weightKg, setWeightKg] = useState(250);
  const [volumeM3, setVolumeM3] = useState(2.5);
  const [priority, setPriority] = useState("STANDARD");
  const [vehicleType, setVehicleType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [allocatedCapacity, setAllocatedCapacity] = useState(null);
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearched(true);
    setAllocatedCapacity(null);
    try {
      const results = await vehicleService.allocate({
        weightKg: Number(weightKg),
        volumeM3: Number(volumeM3),
        priority,
        vehicleType: vehicleType || void 0
      });
      setRecommendations(results || []);
    } catch (err) {
      console.error(err);
      error("Allocation search failed", err.response?.data?.message || "Failed to calculate allocation");
    } finally {
      setIsSearching(false);
    }
  };
  const handleConfirmAllocation = async () => {
    if (!selectedRec) return;
    setIsConfirming(true);
    try {
      const updatedCap = await vehicleService.confirmAllocation({
        vehicleId: selectedRec.vehicle.id,
        weightKg: Number(weightKg),
        volumeM3: Number(volumeM3)
      });
      setAllocatedCapacity(updatedCap);
      success(
        "Capacity Allocated!",
        `Consignment successfully assigned to vehicle ${selectedRec.vehicle.registrationNumber}`
      );
      setSelectedRec(null);
      const refreshed = await vehicleService.allocate({
        weightKg: Number(weightKg),
        volumeM3: Number(volumeM3),
        priority,
        vehicleType: vehicleType || void 0
      }).catch(() => []);
      setRecommendations(refreshed);
    } catch (err) {
      console.error(err);
      error("Confirmation failed", err.response?.data?.message || "Could not allocate vehicle");
    } finally {
      setIsConfirming(false);
    }
  };
  return <div className="space-y-6 max-w-6xl mx-auto"><Breadcrumb
    items={[
      { label: "Fleet", path: "/fleet" },
      { label: "Capacity Allocation Engine" }
    ]}
  /><div className="flex items-center justify-between"><div className="flex items-center space-x-3"><div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm"><Cpu className="w-6 h-6" /></div><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Intelligent Vehicle Capacity Allocation Engine
            </h2><p className="text-xs text-slate-500 mt-0.5">
              Multi-variable optimization matching payload weight, volume, and priority with available fleet space.
            </p></div></div></div>{
    /* Input Parameters Card */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><Sparkles className="w-4 h-4 text-indigo-600" /><span>Cargo Payload Parameters</span></h3><form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Consignment Weight (Kg)
            </label><input
    type="number"
    step="1"
    required
    value={weightKg}
    onChange={(e) => setWeightKg(Number(e.target.value))}
    placeholder="e.g. 350"
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Consignment Volume (m&sup3;)
            </label><input
    type="number"
    step="0.1"
    required
    value={volumeM3}
    onChange={(e) => setVolumeM3(Number(e.target.value))}
    placeholder="e.g. 3.2"
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dispatch Priority
            </label><select
    value={priority}
    onChange={(e) => setPriority(e.target.value)}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
  ><option value="LOW">Low</option><option value="STANDARD">Standard</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Vehicle Type (Optional)
            </label><select
    value={vehicleType}
    onChange={(e) => setVehicleType(e.target.value)}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
  ><option value="">Any Vehicle Type</option><option value="MINI_TRUCK">Mini Truck</option><option value="DELIVERY_VAN">Delivery Van</option><option value="PICKUP_TRUCK">Pickup Truck</option><option value="HEAVY_TRUCK">Heavy Truck</option><option value="CONTAINER_TRUCK">Container Truck</option></select></div><div><button
    type="submit"
    disabled={isSearching}
    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
  >{isSearching ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Search className="w-4 h-4" /><span>Find Available Vehicles</span></>}</button></div></form></div>{
    /* Success Notification If Allocated */
  }{allocatedCapacity && <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in"><div className="flex items-center space-x-3"><CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /><div><p className="font-bold text-sm">Allocation Confirmed & Vehicle Load Synchronized</p><p className="mt-0.5 text-emerald-700">
                New Load: {allocatedCapacity.currentWeightKg} / {allocatedCapacity.maxWeightKg} kg (
                {allocatedCapacity.weightUtilizationPct}%) &bull; Volume: {allocatedCapacity.currentVolumeM3} / {allocatedCapacity.maxVolumeM3} m&sup3; ({allocatedCapacity.volumeUtilizationPct}%)
              </p></div></div><button
    onClick={() => navigate(`/fleet/${allocatedCapacity.vehicleId}`)}
    className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
  >
            View Vehicle &rarr;
          </button></div>}{
    /* Ranked Recommendations Table */
  }{searched && <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex items-center justify-between"><div><h3 className="text-base font-bold text-slate-900">
                Ranked Allocation Recommendations ({recommendations.length})
              </h3><p className="text-xs text-slate-500">
                Sorted by best load factor optimization and minimal empty-mile deadheading.
              </p></div></div><div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider"><th className="py-3 px-4">Score & Fit</th><th className="py-3 px-4">Vehicle Details</th><th className="py-3 px-4">Max Payload</th><th className="py-3 px-4">Remaining Space</th><th className="py-3 px-4">Projected Weight %</th><th className="py-3 px-4">Projected Volume %</th><th className="py-3 px-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{recommendations.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                      No vehicles found capable of accommodating the required weight ({weightKg} kg) and volume ({volumeM3} m&sup3;).
                    </td></tr> : recommendations.map((rec) => {
    const isFit = rec.canAccommodate;
    return <tr
      key={rec.vehicle.id}
      className={`hover:bg-slate-50/70 transition-colors ${!isFit ? "opacity-60 bg-slate-50/30" : ""}`}
    >{
      /* Score & Fit */
    }<td className="py-3.5 px-4"><div className="flex items-center space-x-2"><span
      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${rec.recommendationScore >= 80 ? "bg-emerald-100 text-emerald-800" : rec.recommendationScore >= 60 ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}
    >{rec.recommendationScore || 90}</span><span className="text-xs font-semibold text-slate-800">{rec.recommendationLabel || (isFit ? "Optimal Fit" : "Exceeds Limit")}</span></div></td>{
      /* Vehicle details */
    }<td className="py-3.5 px-4"><span className="font-mono font-bold text-slate-900 text-xs">{rec.vehicle.registrationNumber}</span><span className="block text-[11px] text-slate-400">{rec.vehicle.manufacturer} {rec.vehicle.model} ({rec.vehicle.type?.replace("_", " ")})
                          </span></td>{
      /* Max payload */
    }<td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{rec.vehicle.maxWeightKg} kg / {rec.vehicle.maxVolumeM3} m&sup3;
                        </td>{
      /* Remaining */
    }<td className="py-3.5 px-4 text-xs"><span className="font-bold text-emerald-700">{rec.remainingWeight} kg
                          </span><span className="block text-slate-400 text-[11px]">{rec.remainingVolume} m&sup3;
                          </span></td>{
      /* Weight % */
    }<td className="py-3.5 px-4 w-36"><ProgressBar value={rec.weightUtilizationPct} size="sm" /></td>{
      /* Volume % */
    }<td className="py-3.5 px-4 w-36"><ProgressBar value={rec.volumeUtilizationPct} size="sm" /></td>{
      /* Action */
    }<td className="py-3.5 px-4 text-right"><button
      type="button"
      disabled={!isFit}
      onClick={() => setSelectedRec(rec)}
      className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    ><span>Allocate</span><ArrowRight className="w-3.5 h-3.5 ml-1" /></button></td></tr>;
  })}</tbody></table></div></div>}{
    /* Confirmation Modal */
  }<ConfirmModal
    isOpen={!!selectedRec}
    onClose={() => setSelectedRec(null)}
    onConfirm={handleConfirmAllocation}
    title="Confirm Vehicle Allocation"
    message={selectedRec ? `Are you sure you want to assign this consignment (${weightKg} kg, ${volumeM3} m\xB3) to vehicle ${selectedRec.vehicle.registrationNumber} (${selectedRec.vehicle.model})? Current load will increase to ${selectedRec.weightUtilizationPct}% weight capacity.` : ""}
    confirmText="Confirm & Allocate"
    variant="primary"
    isLoading={isConfirming}
  /></div>;
};
