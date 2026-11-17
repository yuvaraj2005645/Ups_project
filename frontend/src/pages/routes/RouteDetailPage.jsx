import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  Trash2
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { routeService } from "../../services/routeService";
import { vehicleService } from "../../services/vehicleService";
import { driverService } from "../../services/driverService";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Breadcrumb } from "../../components/Breadcrumb";
import { useToast } from "../../components/Toast";
const createIcon = (color, label) => L.divIcon({
  className: "custom-leaflet-pin",
  html: `<div style="
      background-color: ${color};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 11px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${label}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});
export const RouteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [route, setRoute] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fetchRoute = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await routeService.getById(id);
      setRoute(r);
      if (r.vehicleId) {
        const v = await vehicleService.getById(r.vehicleId).catch(() => null);
        setVehicle(v);
      }
      if (r.driverId) {
        const d = await driverService.getById(r.driverId).catch(() => null);
        setDriver(d);
      }
    } catch (err) {
      console.error(err);
      error("Error", "Failed to load route plan.");
    } finally {
      setLoading(false);
    }
  }, [id, error]);
  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);
  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await routeService.delete(id);
      success("Route Removed", "Delivery route plan deleted.");
      navigate("/routes");
    } catch (err) {
      error("Delete failed", err.response?.data?.message || "Could not delete route");
    } finally {
      setIsDeleting(false);
    }
  };
  if (loading && !route) return <LoadingSpinner fullPage message="Loading route map and waypoints..." />;
  if (!route) {
    return <div className="p-8 text-center space-y-4"><p className="text-slate-600">Route not found.</p><button onClick={() => navigate("/routes")} className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg">
          Back to Routes
        </button></div>;
  }
  const stops = route.stops || [];
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];
  const originCoord = firstStop ? [firstStop.lat, firstStop.lng] : [13.0827, 80.2707];
  const polylineCoords = stops.map((s) => [s.lat, s.lng]);
  const mapCenter = originCoord;
  return <div className="space-y-6 max-w-6xl mx-auto"><Breadcrumb items={[{ label: "Routes", path: "/routes" }, { label: route.name }]} /><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="flex items-center space-x-3"><button onClick={() => navigate("/routes")} className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5" /></button><div><div className="flex items-center space-x-3"><h2 className="text-xl font-bold text-slate-900 tracking-tight">{route.name}</h2><StatusBadge status={route.status} type="route" /></div><p className="text-xs text-slate-500 mt-0.5">{route.originName} → {lastStop?.city || "Multiple stops"}</p></div></div><button
    onClick={() => setDeleteModalOpen(true)}
    className="inline-flex items-center px-3.5 py-2 rounded-xl text-rose-600 border border-rose-200 hover:bg-rose-50 text-xs font-semibold transition-colors"
  ><Trash2 className="w-4 h-4 mr-1.5" />Delete Route
        </button></div>{
    /* Route Map */
  }<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-4 border-b border-slate-100 flex items-center justify-between"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm"><Navigation className="w-4 h-4 text-primary" /><span>Interactive Route Map</span></div><div className="flex items-center space-x-3 text-xs"><span className="flex items-center space-x-1 text-emerald-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /><span>Start</span></span><span className="flex items-center space-x-1 text-blue-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span>Stop</span></span><span className="flex items-center space-x-1 text-rose-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /><span>Final</span></span></div></div><div className="h-96 w-full relative z-0"><MapContainer center={mapCenter} zoom={8} scrollWheelZoom={false} className="h-full w-full"><TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />{stops.map((stop, index) => <Marker
    key={index}
    position={[stop.lat, stop.lng]}
    icon={createIcon(
      index === 0 ? "#10B981" : index === stops.length - 1 ? "#EF4444" : "#2563EB",
      index === 0 ? "A" : index === stops.length - 1 ? "B" : String(index + 1)
    )}
  ><Popup><div className="text-xs"><p className="font-bold">Stop #{index + 1} – {stop.city}</p><p>{stop.address}</p></div></Popup></Marker>)}{polylineCoords.length > 1 && <Polyline positions={polylineCoords} color="#2563EB" weight={4} opacity={0.8} />}</MapContainer></div></div>{
    /* Grid: Stops Timeline & Assets */
  }<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><MapPin className="w-4 h-4 text-primary" /><span>Planned Stop Sequence</span></h3><div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-2 pt-2"><div className="relative"><div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-50" /><span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Origin</span><p className="text-xs font-semibold text-slate-800 mt-0.5">{route.originName}</p></div>{stops.map((stop, i) => <div key={i} className="relative"><div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-blue-50" /><span className="text-[11px] font-bold text-primary uppercase tracking-wider">Stop #{i + 1}</span><p className="text-xs font-semibold text-slate-800 mt-0.5">{stop.address}, {stop.city}</p><span className="text-[10px] text-slate-400 font-mono">Lat: {stop.lat}, Lng: {stop.lng}</span><StatusBadge status={stop.status} type="stop" /></div>)}</div></div><div className="space-y-6"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900">Route Metrics</h3><div className="space-y-3 text-xs"><div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center"><span className="text-slate-500">Total Distance</span><span className="font-bold text-slate-800">{route.totalDistanceKm} km</span></div><div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center"><span className="text-slate-500"><Clock className="w-3 h-3 inline mr-1" />Est. Duration</span><span className="font-bold text-slate-800">{Math.floor(route.estimatedDurationMin / 60)}h {route.estimatedDurationMin % 60}m
                </span></div><div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center"><span className="text-slate-500">Stops</span><span className="font-bold text-slate-800">{stops.length}</span></div><div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center"><span className="text-slate-500">Optimized</span><span className={`font-bold ${route.optimized ? "text-emerald-600" : "text-slate-400"}`}>{route.optimized ? "Yes" : "No"}</span></div>{route.optimized && route.originalDistanceKm > 0 && <div className="p-3 bg-emerald-50 rounded-xl flex justify-between items-center"><span className="text-emerald-700">Distance Saved</span><span className="font-bold text-emerald-700">{(route.originalDistanceKm - route.totalDistanceKm).toFixed(1)} km
                  </span></div>}</div></div><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900">Assigned Fleet</h3><div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle</p>{vehicle ? <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"><div><p className="font-mono font-bold text-xs text-slate-900">{vehicle.registrationNumber}</p><p className="text-[11px] text-slate-400">{vehicle.manufacturer} {vehicle.model}</p></div><StatusBadge status={vehicle.status} type="vehicle" /></div> : <p className="text-xs text-slate-400 italic">No vehicle assigned.</p>}</div><div className="pt-2 border-t border-slate-100"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Driver</p>{driver ? <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"><div><p className="font-bold text-xs text-slate-900">{driver.name}</p><p className="text-[11px] text-slate-400">{driver.phone}</p></div><StatusBadge status={driver.status} type="driver" /></div> : <p className="text-xs text-slate-400 italic">No driver assigned.</p>}</div></div></div></div><ConfirmModal
    isOpen={deleteModalOpen}
    onClose={() => setDeleteModalOpen(false)}
    onConfirm={handleDelete}
    title="Delete Delivery Route"
    message="Are you sure you want to remove this delivery route? This cannot be undone."
    confirmText="Delete"
    variant="danger"
    isLoading={isDeleting}
  /></div>;
};
