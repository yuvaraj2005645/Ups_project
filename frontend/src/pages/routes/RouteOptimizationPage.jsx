import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Package,
  Truck,
  TrendingDown,
  Clock,
  CheckCircle2,
  Save
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { routeService } from "../../services/routeService";
import { shipmentService } from "../../services/shipmentService";
import { vehicleService } from "../../services/vehicleService";
import { warehouseService } from "../../services/warehouseService";
import { Breadcrumb } from "../../components/Breadcrumb";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
const createIcon = (color, label) => L.divIcon({
  className: "custom-leaflet-pin",
  html: `<div style="
      background-color: ${color};
      color: white;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 11px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${label}</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});
export const RouteOptimizationPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [startLat, setStartLat] = useState(13.0827);
  const [startLng, setStartLng] = useState(80.2707);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sList, vList, wList] = await Promise.all([
          shipmentService.getAll({ status: "PENDING" }).catch(() => []),
          vehicleService.getAll({ status: "AVAILABLE" }).catch(() => []),
          warehouseService.getAll().catch(() => [])
        ]);
        setShipments(sList || []);
        setVehicles(vList || []);
        setWarehouses(wList || []);
        if (sList && sList.length > 0) {
          setSelectedShipmentIds(sList.slice(0, Math.min(4, sList.length)).map((s) => s.id));
        }
        if (vList && vList.length > 0) setSelectedVehicleId(vList[0].id);
        if (wList && wList.length > 0) {
          const w = wList[0];
          setSelectedWarehouseId(w.id);
          setStartLocation(`${w.name}, ${w.city}`);
          setStartLat(w.lat);
          setStartLng(w.lng);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const toggleShipmentSelect = (id) => {
    setSelectedShipmentIds(
      (prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const handleWarehouseChange = (warehouseId) => {
    const w = warehouses.find((item) => item.id === warehouseId);
    if (w) {
      setSelectedWarehouseId(warehouseId);
      setStartLocation(`${w.name}, ${w.city}`);
      setStartLat(w.lat);
      setStartLng(w.lng);
    }
  };
  const handleOptimize = async () => {
    if (selectedShipmentIds.length === 0) {
      error("Selection required", "Please select at least one shipment to optimize.");
      return;
    }
    setIsOptimizing(true);
    setResult(null);
    try {
      const selectedShipments = shipments.filter((s) => selectedShipmentIds.includes(s.id));
      const stops = selectedShipments.map((s, i) => ({
        sequence: i + 1,
        address: s.deliveryAddress,
        city: s.deliveryAddress.split(",").pop()?.trim() || "City",
        lat: s.deliveryLat,
        lng: s.deliveryLng,
        shipmentId: s.id,
        status: "PENDING"
      }));
      const optimization = await routeService.optimize({
        warehouseId: selectedWarehouseId,
        originLat: startLat,
        originLng: startLng,
        stops
      });
      setResult(optimization);
      success("Route Optimized!", `Saved ${optimization.distanceSavedKm.toFixed(1)} km vs original.`);
    } catch (err) {
      console.error(err);
      error("Optimization Failed", err.response?.data?.message || "Could not optimize route");
    } finally {
      setIsOptimizing(false);
    }
  };
  const handleApplyAndSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const created = await routeService.create({
        name: `AI Optimized Route (${(/* @__PURE__ */ new Date()).toLocaleDateString()})`,
        warehouseId: selectedWarehouseId,
        originName: startLocation,
        stops: result.optimizedStops,
        totalDistanceKm: result.optimizedDistanceKm,
        estimatedDurationMin: Math.round(result.optimizedDistanceKm / 60 * 60),
        vehicleId: selectedVehicleId || void 0,
        shipmentIds: selectedShipmentIds,
        status: "PLANNED",
        optimized: true,
        originalDistanceKm: result.originalDistanceKm
      });
      success("Route Saved", `Optimized plan saved as route #${created.name}`);
      navigate(`/routes/${created.id}`);
    } catch (err) {
      console.error(err);
      error("Save failed", err.response?.data?.message || "Could not save optimized route");
    } finally {
      setIsSaving(false);
    }
  };
  if (loading) return <LoadingSpinner fullPage message="Loading shipments and fleet for optimization..." />;
  const originCoord = [startLat, startLng];
  const polylinePoints = result ? [originCoord, ...result.optimizedStops.map((s) => [s.lat, s.lng])] : [];
  return <div className="space-y-6 max-w-6xl mx-auto"><Breadcrumb
    items={[{ label: "Routes", path: "/routes" }, { label: "AI Route Optimizer" }]}
  /><div className="flex items-center space-x-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm"><Zap className="w-6 h-6" /></div><div><h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Multi-Stop Route Optimization Engine</h2><p className="text-xs text-slate-500 mt-0.5">Nearest-Neighbor heuristic optimizer with Haversine distance calculations.</p></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{
    /* Shipments checklist */
  }<div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"><div className="flex items-center justify-between pb-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><Package className="w-4 h-4 text-primary" /><span>1. Select Shipments ({selectedShipmentIds.length} Selected)</span></h3><span className="text-xs text-slate-400">{shipments.length} Pending Shipments</span></div><div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-2">{shipments.length > 0 ? shipments.map((s) => {
    const isSelected = selectedShipmentIds.includes(s.id);
    return <div
      key={s.id}
      onClick={() => toggleShipmentSelect(s.id)}
      className={`py-3 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${isSelected ? "bg-blue-50/70 border border-blue-200" : "hover:bg-slate-50"}`}
    ><div className="flex items-center space-x-3"><input type="checkbox" checked={isSelected} onChange={() => {
    }} className="w-4 h-4 text-primary rounded border-slate-300 pointer-events-none" /><div><div className="flex items-center space-x-2"><span className="font-semibold text-xs text-slate-800">{s.customerName}</span><span className="text-[10px] font-mono text-slate-400">#{s.id}</span></div><p className="text-[11px] text-slate-500 truncate max-w-sm">{s.deliveryAddress}</p></div></div><div className="text-right shrink-0"><span className="text-xs font-bold text-slate-700">{s.weightKg} kg</span><span className="block text-[10px] text-slate-400">{s.volumeM3} m³</span></div></div>;
  }) : <div className="p-8 text-center text-xs text-slate-400">No pending shipments available.</div>}</div></div>{
    /* Config Panel */
  }<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100"><Truck className="w-4 h-4 text-primary" /><span>2. Dispatch Hub & Vehicle</span></h3><div className="space-y-3"><div><label className="block text-xs font-semibold text-slate-700 mb-1">Start Warehouse</label><select
    value={selectedWarehouseId}
    onChange={(e) => handleWarehouseChange(e.target.value)}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
  ><option value="">-- Choose Warehouse --</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.city})</option>)}</select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Hub Location</label><input
    type="text"
    value={startLocation}
    onChange={(e) => setStartLocation(e.target.value)}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
  /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle</label><select
    value={selectedVehicleId}
    onChange={(e) => setSelectedVehicleId(e.target.value)}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
  ><option value="">-- Auto-Select Best --</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber} ({v.type?.replace("_", " ")} – {v.maxWeightKg}kg)</option>)}</select></div><button
    type="button"
    onClick={handleOptimize}
    disabled={isOptimizing || selectedShipmentIds.length === 0}
    className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
  >{isOptimizing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Zap className="w-4 h-4" /><span>Execute Optimization</span></>}</button></div></div></div>{
    /* Results */
  }{result && <div className="space-y-6"><div className="grid grid-cols-1 sm:grid-cols-4 gap-4"><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-blue-50 text-primary"><TrendingDown className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 font-semibold uppercase">Total Distance</p><p className="text-xl font-extrabold text-slate-900 mt-0.5">{result.optimizedDistanceKm.toFixed(1)} km</p><p className="text-[11px] text-emerald-600 font-semibold">
                  Saved {result.distanceSavedKm.toFixed(1)} km ({result.improvement.toFixed(1)}%)
                </p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-indigo-50 text-indigo-600"><Clock className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 font-semibold uppercase">Time Saved</p><p className="text-xl font-extrabold text-slate-900 mt-0.5">{result.timeSavedMin} min</p><p className="text-[11px] text-slate-500">vs original sequence</p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><TrendingDown className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 font-semibold uppercase">Original Distance</p><p className="text-xl font-extrabold text-slate-900 mt-0.5">{result.originalDistanceKm.toFixed(1)} km</p><p className="text-[11px] text-slate-500">before optimization</p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-amber-50 text-amber-600"><CheckCircle2 className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 font-semibold uppercase">Total Stops</p><p className="text-xl font-extrabold text-slate-900 mt-0.5">{result.optimizedStops.length} Drops</p><p className="text-[11px] text-slate-500">TSP sequenced</p></div></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{
    /* Map */
  }<div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-4 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-900">Optimized Route Map</h3></div><div className="h-96 w-full"><MapContainer center={originCoord} zoom={8} scrollWheelZoom={false} className="h-full w-full"><TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  /><Marker position={originCoord} icon={createIcon("#10B981", "Hub")}><Popup>{startLocation}</Popup></Marker>{result.optimizedStops.map((s, idx) => <Marker key={idx} position={[s.lat, s.lng]} icon={createIcon("#2563EB", String(idx + 1))}><Popup><div className="text-xs"><p className="font-bold">Stop #{idx + 1}</p><p>{s.address}</p></div></Popup></Marker>)}<Polyline positions={polylinePoints} color="#10B981" weight={4} /></MapContainer></div></div>{
    /* Stop list */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center justify-between pb-2 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-900">Optimized Stop Sequence</h3></div><div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs"><div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl"><span className="font-bold text-emerald-800">Start: Dispatch Hub</span><p className="text-[11px] text-emerald-700 mt-0.5">{startLocation}</p></div>{result.optimizedStops.map((s, index) => <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-xl"><div className="flex items-center space-x-2"><span className="w-5 h-5 rounded-full bg-primary text-white font-bold text-[10px] flex items-center justify-center shrink-0">{index + 1}</span><span className="font-semibold text-slate-800">Stop #{index + 1} – {s.city}</span></div><p className="text-[11px] text-slate-600 mt-1 pl-7">{s.address}</p></div>)}</div><button
    type="button"
    onClick={handleApplyAndSave}
    disabled={isSaving}
    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
  >{isSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /><span>Apply & Save Plan</span></>}</button></div></div></div>}</div>;
};
