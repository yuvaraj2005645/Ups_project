import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Clock,
  Truck,
  User,
  Navigation,
  CheckCircle2,
  AlertCircle,
  History,
  Send,
  Edit,
} from 'lucide-react';
import { shipmentService } from '../../services/shipmentService';
import { driverService } from '../../services/driverService';
import { vehicleService } from '../../services/vehicleService';
import { routeService } from '../../services/routeService';
import {
  Shipment,
  ShipmentHistory,
  ShipmentStatus,
  Driver,
  Vehicle,
  Route,
} from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useToast } from '../../components/Toast';

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentHistory[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Status update form state
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('PENDING');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Assignment form state
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchShipmentData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [shipmentData, historyData, driverList, vehicleList, routeList] =
        await Promise.all([
          shipmentService.getById(id),
          shipmentService.getHistory(id).catch(() => []),
          driverService.getAll().catch(() => []),
          vehicleService.getAll().catch(() => []),
          routeService.getAll().catch(() => []),
        ]);

      setShipment(shipmentData);
      setHistory(historyData || []);
      setDrivers(driverList || []);
      setVehicles(vehicleList || []);
      setRoutes(routeList || []);

      if (shipmentData) {
        setNewStatus(shipmentData.status);
        setSelectedDriverId(shipmentData.driverId || '');
        setSelectedVehicleId(shipmentData.vehicleId || '');
        setSelectedRouteId(shipmentData.routeId || '');
      }
    } catch (err) {
      console.error(err);
      error('Failed to load shipment details', 'The requested record could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  useEffect(() => {
    fetchShipmentData();
  }, [fetchShipmentData]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newStatus) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await shipmentService.updateStatus(id, newStatus, statusRemarks);
      setShipment(updated);
      success('Status Updated', `Shipment status changed to ${newStatus}`);
      setStatusRemarks('');
      // Refresh history
      const hData = await shipmentService.getHistory(id).catch(() => []);
      setHistory(hData);
    } catch (err: any) {
      error('Status update failed', err.response?.data?.message || 'Could not update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsAssigning(true);
    try {
      const updated = await shipmentService.assign(id, {
        driverId: selectedDriverId || undefined,
        vehicleId: selectedVehicleId || undefined,
        routeId: selectedRouteId || undefined,
      });
      setShipment(updated);
      success('Assignment Saved', 'Driver, vehicle, and route assignment applied.');
      // Refresh history
      const hData = await shipmentService.getHistory(id).catch(() => []);
      setHistory(hData);
    } catch (err: any) {
      error('Assignment failed', err.response?.data?.message || 'Could not assign resources');
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading && !shipment) {
    return <LoadingSpinner fullPage message="Loading shipment details..." />;
  }

  if (!shipment) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600">Shipment not found.</p>
        <button
          onClick={() => navigate('/shipments')}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Back to Shipments
        </button>
      </div>
    );
  }

  const assignedDriver = drivers.find((d) => d.id === shipment.driverId);
  const assignedVehicle = vehicles.find((v) => v.id === shipment.vehicleId);
  const assignedRoute = routes.find((r) => r.id === shipment.routeId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Shipments', path: '/shipments' },
          { label: `#${shipment.id.slice(-6).toUpperCase()}` },
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/shipments')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Shipment #{shipment.id.slice(-6).toUpperCase()}
              </h2>
              <StatusBadge status={shipment.status} />
              <StatusBadge status={shipment.priority} type="priority" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-semibold text-slate-700">{shipment.customerName}</span> &bull;
              Created: {new Date(shipment.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate(`/shipments/${shipment.id}/tracking`)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Navigation className="w-4 h-4 mr-1.5" />
            Track Journey
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Shipment Specs & Locations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Package className="w-4 h-4 text-primary" />
              <span>Consignment Specifications</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Weight</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{shipment.weightKg} kg</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Volume</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{shipment.volumeM3} m&sup3;</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Quantity</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{shipment.quantity || 1} units</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Expected By</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">
                  {shipment.expectedDeliveryDate ? new Date(shipment.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Description</p>
              <p className="text-sm text-slate-800 mt-1">{shipment.packageDescription}</p>
            </div>

            {shipment.notes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold">Handling Notes:</span> {shipment.notes}
              </div>
            )}
          </div>

          {/* Route & Address Points */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Route & Waypoints</span>
            </h3>

            <div className="relative pl-6 border-l-2 border-primary/30 space-y-6 ml-2">
              {/* Pickup Point */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary ring-4 ring-blue-50"></div>
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Origin (Pickup)</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{shipment.pickupAddress}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Lat: {shipment.pickupLat}, Lng: {shipment.pickupLng}
                  </p>
                </div>
              </div>

              {/* Delivery Point */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-50"></div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                    Destination (Delivery)
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{shipment.deliveryAddress}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Lat: {shipment.deliveryLat}, Lng: {shipment.deliveryLng}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipment Timeline & Audit Log */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <History className="w-4 h-4 text-primary" />
              <span>Status Audit History</span>
            </h3>

            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div
                    key={h.id || i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-700">
                          {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                        </span>
                        <span className="text-[10px] text-slate-400">by {h.updatedBy || 'System'}</span>
                      </div>
                      {h.remarks && <p className="text-slate-500 mt-1 italic">"{h.remarks}"</p>}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                      {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No transition events recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Assignments & Status Controls */}
        <div className="space-y-6">
          {/* Status Update Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Update Fulfillment Status</span>
            </h3>

            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="PENDING">Pending</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="FAILED_DELIVERY">Failed Delivery</option>
                  <option value="RETURNED">Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Reason for change, transit checkpoint, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply Status Change</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Operational Assignment Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Resource Assignment</span>
            </h3>

            <form onSubmit={handleAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">-- No Driver Assigned --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.status})
                    </option>
                  ))}
                </select>
                {assignedDriver && (
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Current: {assignedDriver.name} &bull; {assignedDriver.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">-- No Vehicle Assigned --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.type} - Max {v.maxWeightKg}kg)
                    </option>
                  ))}
                </select>
                {assignedVehicle && (
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Current: {assignedVehicle.registrationNumber} ({assignedVehicle.model})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Route</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">-- No Route Assigned --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.totalDistanceKm} km)
                    </option>
                  ))}
                </select>
                {assignedRoute && (
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Current: {assignedRoute.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isAssigning}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isAssigning ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5" />
                    <span>Confirm Resource Assignment</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
