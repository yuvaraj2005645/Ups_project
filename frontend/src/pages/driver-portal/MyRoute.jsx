import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import {
  Map,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { driverService } from "../../services/driverService";
import { routeService } from "../../services/routeService";
import { shipmentService } from "../../services/shipmentService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
import { formatDistance, formatDuration, formatStatus, getStatusColor } from "../../utils/formatters";

const makeIcon = (color, label) =>
  L.divIcon({
    className: "custom-leaflet-pin",
    html: `<div style="background:${color};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid white;">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const stopColor = (status) => {
  if (status === "COMPLETED") return "#10B981";
  if (status === "ARRIVED") return "#F59E0B";
  if (status === "SKIPPED") return "#6B7280";
  return "#2563EB";
};

export const MyRoute = () => {
  const navigate = useNavigate();
  const { error } = useToast();

  const [route, setRoute] = useState(null);
  const [shipmentMap, setShipmentMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRoute = useCallback(async () => {
    setLoading(true);
    try {
      const driver = await driverService.getMe();
      const routes = await routeService.getByDriverId(driver.id);
      if (!routes || routes.length === 0) { setRoute(null); setLoading(false); return; }

      // Prefer ACTIVE route, else most recent
      const active = routes.find(r => r.status === "ACTIVE") || routes[0];
      setRoute(active);

      // Load shipment info for each stop
      const ids = (active.stops || []).filter(s => s.shipmentId).map(s => s.shipmentId);
      const map = {};
      await Promise.all(ids.map(async id => {
        try { map[id] = await shipmentService.getById(id); } catch { /* skip */ }
      }));
      setShipmentMap(map);
    } catch (err) {
      error("Error", err.response?.data?.message || "Failed to load route.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { fetchRoute(); }, [fetchRoute]);

  if (loading) return <LoadingSpinner fullPage message="Loading your route..." />;

  if (!route) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Route</h2>
          <p className="text-xs text-slate-500 mt-0.5">Your assigned delivery route and stops.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <Map className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No Active Route</p>
          <p className="text-xs text-slate-400 mt-1">You don't have an active route assigned. Contact dispatch.</p>
        </div>
      </div>
    );
  }

  const stops = route.stops || [];
  const completedStops = stops.filter(s => s.status === "COMPLETED").length;
  const remainingStops = stops.filter(s => s.status === "PENDING" || s.status === "ARRIVED").length;

  // Build map polyline points from stops that have coordinates
  const hasStops = stops.some(s => s.lat && s.lng);
  const polylinePoints = hasStops ? stops.filter(s => s.lat && s.lng).map(s => [s.lat, s.lng]) : [];
  const mapCenter = polylinePoints.length > 0 ? polylinePoints[0] : [13.0827, 80.2707];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Route</h2>
          <p className="text-xs text-slate-500 mt-0.5">{route.name}</p>
        </div>
        <button onClick={fetchRoute} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Route Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Stops", value: stops.length, icon: MapPin, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Completed", value: completedStops, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Remaining", value: remainingStops, icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Total Distance", value: formatDistance(route.totalDistanceKm), icon: Truck, bg: "bg-indigo-50", color: "text-indigo-600" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Route Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div><p className="text-slate-400 uppercase tracking-wide text-[11px]">Route ID</p><p className="font-bold text-slate-800 mt-0.5 font-mono">{route.id}</p></div>
          <div><p className="text-slate-400 uppercase tracking-wide text-[11px]">Origin</p><p className="font-bold text-slate-800 mt-0.5">{route.originName || "—"}</p></div>
          <div><p className="text-slate-400 uppercase tracking-wide text-[11px]">Est. Duration</p><p className="font-bold text-slate-800 mt-0.5">{formatDuration(route.estimatedDurationMin)}</p></div>
          <div>
            <p className="text-slate-400 uppercase tracking-wide text-[11px]">Status</p>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${getStatusColor(route.status)}`}>
              {formatStatus(route.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>Route Map</span>
          </div>
          <button
            onClick={() => navigate("/driver/navigate")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Live Navigation</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="h-72 w-full">
          <MapContainer center={mapCenter} zoom={9} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stops.filter(s => s.lat && s.lng).map((stop, i) => (
              <Marker key={i} position={[stop.lat, stop.lng]} icon={makeIcon(stopColor(stop.status), stop.sequence)}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">Stop {stop.sequence}: {stop.address}</p>
                    <p className="text-slate-500">{stop.city}</p>
                    <p className="mt-1">Status: <span className="font-semibold">{stop.status}</span></p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {polylinePoints.length > 1 && (
              <Polyline positions={polylinePoints} color="#2563EB" weight={3} dashArray="6,4" />
            )}
          </MapContainer>
        </div>
        {/* Map legend */}
        <div className="p-3 border-t border-slate-100 flex items-center space-x-4 text-[11px] text-slate-500">
          {[["#10B981", "Completed"], ["#F59E0B", "Arrived"], ["#2563EB", "Pending"], ["#6B7280", "Skipped"]].map(([c, l]) => (
            <span key={l} className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} />
              <span>{l}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Stop Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Delivery Stops</h3>
        <div className="space-y-3">
          {stops.map((stop) => {
            const shipment = stop.shipmentId ? shipmentMap[stop.shipmentId] : null;
            const isActive = stop.status === "ARRIVED" || stop.status === "PENDING";
            return (
              <div
                key={stop.sequence}
                className={`bg-white rounded-2xl border shadow-sm p-4 transition-colors ${
                  stop.status === "ARRIVED" ? "border-amber-300 bg-amber-50/30" :
                  stop.status === "COMPLETED" ? "border-emerald-200 opacity-80" :
                  "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
                      style={{ background: stopColor(stop.status) }}
                    >
                      {stop.sequence}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">{stop.address}</p>
                      <p className="text-slate-500">{stop.city}</p>
                      {stop.shipmentId && (
                        <p className="text-blue-600 font-mono mt-0.5">{stop.shipmentId}</p>
                      )}
                      {shipment && (
                        <p className="text-slate-600 mt-0.5">{shipment.customerName}</p>
                      )}
                      {stop.estimatedArrival && (
                        <p className="text-slate-400 mt-0.5 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>ETA: {stop.estimatedArrival}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getStatusColor(stop.status)}`}>
                      {formatStatus(stop.status)}
                    </span>
                    {isActive && (
                      <button
                        onClick={() => navigate("/driver/navigate")}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        title="Navigate"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
