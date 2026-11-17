import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Navigation,
  MapPin,
  Crosshair,
  Wifi,
  WifiOff,
  AlertTriangle,
  ChevronRight,
  Play,
  Square,
  List,
  X,
} from "lucide-react";
import { driverService } from "../../services/driverService";
import { routeService } from "../../services/routeService";
import { useGeolocation } from "../../hooks/useGeolocation";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
import { formatStatus, getStatusColor } from "../../utils/formatters";

// Icon factories
const makeIcon = (color, label, size = 28) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};color:white;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid white;">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const myLocationIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Helper to recenter map to a position
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 14, { duration: 1 });
  }, [position, map]);
  return null;
}

export const RouteNavigation = () => {
  const { error: showError } = useToast();
  const { position, error: gpsError, loading: gpsLoading, supported, start, stop } = useGeolocation();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [recenter, setRecenter] = useState(false);
  const [showAllStops, setShowAllStops] = useState(false);
  const [currentStopIdx, setCurrentStopIdx] = useState(0);

  const fetchRoute = useCallback(async () => {
    setLoading(true);
    try {
      const driver = await driverService.getMe();
      const routes = await routeService.getByDriverId(driver.id);
      const active = (routes || []).find(r => r.status === "ACTIVE") || (routes || [])[0] || null;
      setRoute(active);
      if (active) {
        const nextIdx = (active.stops || []).findIndex(s => s.status === "PENDING" || s.status === "ARRIVED");
        setCurrentStopIdx(nextIdx >= 0 ? nextIdx : 0);
      }
    } catch (err) {
      showError("Error", "Failed to load route data.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchRoute(); }, [fetchRoute]);

  const handleStartNavigation = () => {
    setNavigating(true);
    start();
  };

  const handleStopNavigation = () => {
    setNavigating(false);
    stop();
  };

  const handleRecenter = () => {
    if (!position) { showError("No GPS", "GPS location not available yet."); return; }
    setRecenter(r => !r); // toggle to trigger RecenterMap
  };

  if (loading) return <LoadingSpinner fullPage message="Loading navigation data..." />;

  const stops = route?.stops || [];
  const currentStop = stops[currentStopIdx] || null;
  const nextStop = stops[currentStopIdx + 1] || null;

  // Build map center
  const mapCenter = position
    ? [position.lat, position.lng]
    : currentStop?.lat && currentStop?.lng
    ? [currentStop.lat, currentStop.lng]
    : [13.0827, 80.2707];

  const polylinePoints = stops.filter(s => s.lat && s.lng).map(s => [s.lat, s.lng]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Route Navigation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {route ? route.name : "No active route assigned"}
          </p>
        </div>
        {/* GPS Status */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            !supported ? "bg-slate-100 text-slate-500" :
            gpsError ? "bg-red-50 text-red-600" :
            gpsLoading ? "bg-amber-50 text-amber-600" :
            position ? "bg-emerald-50 text-emerald-700" :
            "bg-slate-100 text-slate-500"
          }`}>
            {gpsError ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>
              {!supported ? "GPS N/A" :
               gpsLoading ? "Acquiring GPS..." :
               gpsError ? "GPS Error" :
               position ? "GPS Active" : "GPS Standby"}
            </span>
          </div>
        </div>
      </div>

      {/* GPS Error Banner */}
      {gpsError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">GPS Unavailable</p>
            <p className="mt-0.5">{gpsError}</p>
          </div>
        </div>
      )}

      {/* Large Map */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[420px] w-full relative">
          <MapContainer center={mapCenter} zoom={10} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Current GPS location */}
            {position && (
              <Marker position={[position.lat, position.lng]} icon={myLocationIcon}>
                <Popup><p className="text-xs font-semibold">Your Location</p></Popup>
              </Marker>
            )}

            {/* Route stops */}
            {stops.filter(s => s.lat && s.lng).map((stop, i) => (
              <Marker
                key={i}
                position={[stop.lat, stop.lng]}
                icon={makeIcon(
                  stop.status === "COMPLETED" ? "#10B981" :
                  i === currentStopIdx ? "#F59E0B" : "#2563EB",
                  stop.sequence,
                  i === currentStopIdx ? 34 : 28
                )}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">Stop {stop.sequence}: {stop.address}</p>
                    <p className="text-slate-500">{stop.city}</p>
                    <p className="mt-1 font-semibold capitalize">{stop.status?.toLowerCase()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route polyline */}
            {polylinePoints.length > 1 && (
              <Polyline positions={polylinePoints} color="#2563EB" weight={3} dashArray="6,4" />
            )}

            {/* Recenter */}
            {navigating && position && <RecenterMap position={position} key={String(recenter)} />}
          </MapContainer>
        </div>

        {/* Map Controls */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {!navigating ? (
            <button
              onClick={handleStartNavigation}
              disabled={!route}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Start Navigation</span>
            </button>
          ) : (
            <button
              onClick={handleStopNavigation}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Square className="w-4 h-4" />
              <span>Stop Navigation</span>
            </button>
          )}

          <button
            onClick={handleRecenter}
            disabled={!position}
            className="flex items-center space-x-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors"
          >
            <Crosshair className="w-4 h-4" />
            <span>Recenter</span>
          </button>

          {currentStopIdx < stops.length - 1 && (
            <button
              onClick={() => setCurrentStopIdx(i => Math.min(stops.length - 1, i + 1))}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Next Stop</span>
            </button>
          )}

          <button
            onClick={() => setShowAllStops(s => !s)}
            className="flex items-center space-x-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors ml-auto"
          >
            <List className="w-4 h-4" />
            <span>{showAllStops ? "Hide" : "All Stops"}</span>
          </button>
        </div>
      </div>

      {/* Current + Next stop info */}
      {route && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current Stop */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm p-5">
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-2 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5" /><span>Current Destination</span>
            </p>
            {currentStop ? (
              <div className="text-xs space-y-1.5">
                <p className="text-lg font-bold text-slate-900">Stop {currentStop.sequence}</p>
                <p className="font-semibold text-slate-700">{currentStop.address}</p>
                <p className="text-slate-500">{currentStop.city}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold ${getStatusColor(currentStop.status)}`}>
                  {formatStatus(currentStop.status)}
                </span>
                {currentStop.shipmentId && (
                  <p className="text-blue-600 font-mono text-[11px]">{currentStop.shipmentId}</p>
                )}
              </div>
            ) : <p className="text-xs text-slate-400">All stops completed.</p>}
          </div>

          {/* Next Stop */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center space-x-1.5">
              <ChevronRight className="w-3.5 h-3.5" /><span>Next Stop</span>
            </p>
            {nextStop ? (
              <div className="text-xs space-y-1.5">
                <p className="text-lg font-bold text-slate-700">Stop {nextStop.sequence}</p>
                <p className="font-semibold text-slate-600">{nextStop.address}</p>
                <p className="text-slate-400">{nextStop.city}</p>
                {nextStop.shipmentId && (
                  <p className="text-blue-500 font-mono text-[11px]">{nextStop.shipmentId}</p>
                )}
              </div>
            ) : <p className="text-xs text-slate-400">No further stops.</p>}
          </div>
        </div>
      )}

      {/* GPS coordinates info */}
      {position && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">GPS Location</span>
          </div>
          <div className="font-mono">
            <span className="text-emerald-400">{position.lat.toFixed(5)}</span>
            <span className="text-slate-500 mx-1">,</span>
            <span className="text-emerald-400">{position.lng.toFixed(5)}</span>
            {position.accuracy && (
              <span className="text-slate-400 ml-2">±{Math.round(position.accuracy)}m</span>
            )}
          </div>
        </div>
      )}

      {/* All Stops Drawer */}
      {showAllStops && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">All Stops ({stops.length})</h3>
            <button onClick={() => setShowAllStops(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {stops.map((stop, i) => (
              <div
                key={i}
                className={`p-4 flex items-start space-x-3 cursor-pointer hover:bg-slate-50 transition-colors ${i === currentStopIdx ? "bg-amber-50" : ""}`}
                onClick={() => { setCurrentStopIdx(i); setShowAllStops(false); }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                  style={{ background: stop.status === "COMPLETED" ? "#10B981" : i === currentStopIdx ? "#F59E0B" : "#2563EB" }}
                >
                  {stop.sequence}
                </div>
                <div className="text-xs flex-1">
                  <p className="font-semibold text-slate-800">{stop.address}</p>
                  <p className="text-slate-400">{stop.city}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getStatusColor(stop.status)}`}>
                  {formatStatus(stop.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
