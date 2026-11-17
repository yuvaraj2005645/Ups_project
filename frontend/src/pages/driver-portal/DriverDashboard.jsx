import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Navigation,
  ArrowRight
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "../../contexts/AuthContext";
import { driverService } from "../../services/driverService";
import { deliveryService } from "../../services/deliveryService";
import { vehicleService } from "../../services/vehicleService";
import { routeService } from "../../services/routeService";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../components/Toast";
const createIcon = (color, label) => L.divIcon({
  className: "custom-leaflet-pin",
  html: `<div style="
      background-color: ${color};
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${label}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});
export const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [route, setRoute] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDriverData = async () => {
      setLoading(true);
      try {
        const drivers = await driverService.getAll();
        const currentDriver = drivers.find((d) => d.email === user?.email || d.name === user?.name) || drivers[0];
        if (currentDriver) {
          setDriver(currentDriver);
          const [v, dList, rList] = await Promise.all([
            currentDriver.vehicleId ? vehicleService.getById(currentDriver.vehicleId).catch(() => null) : null,
            deliveryService.getByDriverId(currentDriver.id).catch(() => []),
            routeService.getAll({ driverId: currentDriver.id }).catch(() => [])
          ]);
          setVehicle(v);
          setTodayDeliveries(dList || []);
          setRoute(rList && rList.length > 0 ? rList[0] : null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDriverData();
  }, [user]);
  if (loading) {
    return <LoadingSpinner fullPage message="Connecting to driver manifest & telemetry..." />;
  }
  const completedDeliveries = todayDeliveries.filter((d) => d.status === "DELIVERED").length;
  const pendingDeliveries = todayDeliveries.length - completedDeliveries;
  const defaultCoord = [13.0827, 80.2707];
  const routePoints = route ? [
    [route.originLat || 13.0827, route.originLng || 80.2707],
    ...(route.waypoints || []).map((w) => [w.lat, w.lng]),
    [route.destinationLat || 12.9716, route.destinationLng || 77.5946]
  ] : [defaultCoord];
  return <div className="space-y-6 max-w-5xl mx-auto">{
    /* Welcome Banner */
  }<div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg"><div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" /><div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                Driver Active Shift
              </span></div><h2 className="text-2xl font-bold mt-1">Hello, {driver?.name || user?.name}!</h2><p className="text-xs text-slate-300 mt-1 max-w-md">
              You have {pendingDeliveries} drops remaining on today's manifest corridor. Drive safely.
            </p></div><div className="flex items-center space-x-3"><button
    onClick={() => navigate("/driver/deliveries")}
    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
  ><span>View Manifest</span><ArrowRight className="w-4 h-4" /></button></div></div></div>{
    /* 3 Metrics Cards */
  }<div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-blue-50 text-primary"><Package className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-slate-900">{todayDeliveries.length}</h3><p className="text-xs text-slate-400 mt-0.5">Assigned Deliveries</p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-slate-900">{completedDeliveries}</h3><p className="text-xs text-slate-400 mt-0.5">Completed Drops</p></div></div><div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"><div className="p-3 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-slate-900">{pendingDeliveries}</h3><p className="text-xs text-slate-400 mt-0.5">Pending Deliveries</p></div></div></div>{
    /* Vehicle Asset & Corridor Map */
  }<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{
    /* Left: Assigned Vehicle Info */
  }<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100"><Truck className="w-4 h-4 text-primary" /><span>Assigned Vehicle Asset</span></h3>{vehicle ? <div className="space-y-3 text-xs"><div className="p-3.5 bg-slate-50 rounded-xl"><span className="text-[11px] text-slate-400 font-semibold block uppercase">
                  License Plate
                </span><span className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 block">{vehicle.registrationNumber}</span></div><div className="grid grid-cols-2 gap-2"><div className="p-3 bg-slate-50 rounded-xl"><span className="text-[11px] text-slate-400 block">Chassis Model</span><span className="font-semibold text-slate-800">{vehicle.manufacturer} {vehicle.model}</span></div><div className="p-3 bg-slate-50 rounded-xl"><span className="text-[11px] text-slate-400 block">Fuel Type</span><span className="font-semibold text-slate-800">{vehicle.fuelType}</span></div></div><div className="p-3 bg-slate-50 rounded-xl"><span className="text-[11px] text-slate-400 block">Current Capacity Load</span><span className="font-bold text-slate-800">{vehicle.currentWeightKg || 0} / {vehicle.maxWeightKg} kg
                </span></div></div> : <p className="text-xs text-slate-400 italic p-4 text-center">
              No vehicle assigned to your shift today.
            </p>}</div>{
    /* Right: Route Trajectory Map */
  }<div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"><div className="p-4 border-b border-slate-100 flex items-center justify-between"><div className="flex items-center space-x-2 text-slate-900 font-bold text-sm"><Navigation className="w-4 h-4 text-primary" /><span>Today's Transit Route Navigation</span></div>{route && <span className="text-xs font-semibold text-slate-500">{route.totalDistanceKm} km &bull; ~{Math.floor(route.estimatedDurationMin / 60)}h
              </span>}</div><div className="h-64 w-full flex-1"><MapContainer
    center={routePoints[0]}
    zoom={8}
    scrollWheelZoom={false}
    className="h-full w-full"
  ><TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  /><Marker position={routePoints[0]} icon={createIcon("#10B981", "A")}><Popup>Origin Hub</Popup></Marker>{route?.waypoints?.map((w, i) => <Marker key={i} position={[w.lat, w.lng]} icon={createIcon("#2563EB", String(i + 1))}><Popup>{w.address}</Popup></Marker>)}{routePoints.length > 1 && <Marker
    position={routePoints[routePoints.length - 1]}
    icon={createIcon("#EF4444", "B")}
  ><Popup>Destination</Popup></Marker>}{routePoints.length > 1 && <Polyline positions={routePoints} color="#2563EB" weight={4} />}</MapContainer></div></div></div>{
    /* Today's Active Deliveries Checklist */
  }<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">Today's Delivery Manifest Queue</h3><span className="text-xs text-slate-400">{todayDeliveries.length} Packages</span></div><div className="divide-y divide-slate-100">{todayDeliveries.length > 0 ? todayDeliveries.map((d, index) => <div
    key={d.id}
    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
  ><div className="flex items-start space-x-3"><div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{index + 1}</div><div><div className="flex items-center space-x-2"><span className="font-bold text-xs text-slate-900">{d.receiverName || "Recipient Drop"}</span><StatusBadge status={d.status} type="delivery" /></div><p className="text-xs text-slate-600 mt-0.5">{d.destinationAddress}</p><span className="text-[11px] text-slate-400">{d.destinationCity}</span></div></div><div className="flex items-center space-x-2 self-end sm:self-auto">{d.status !== "DELIVERED" && <button
    onClick={() => navigate(`/driver/pod/${d.id}`)}
    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
  ><CheckCircle2 className="w-3.5 h-3.5" /><span>Complete Drop</span></button>}</div></div>) : <div className="p-8 text-center text-xs text-slate-400">
              No packages assigned for today. Check with operations dispatch.
            </div>}</div></div></div>;
};
