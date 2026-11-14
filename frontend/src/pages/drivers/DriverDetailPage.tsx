import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Star,
  Shield,
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit,
} from 'lucide-react';
import { driverService } from '../../services/driverService';
import { vehicleService } from '../../services/vehicleService';
import { shipmentService } from '../../services/shipmentService';
import { deliveryService } from '../../services/deliveryService';
import { Driver, Vehicle, Shipment, Delivery } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useToast } from '../../components/Toast';

export const DriverDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDriverData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await driverService.getById(id);
      setDriver(d);

      if (d.vehicleId) {
        const v = await vehicleService.getById(d.vehicleId).catch(() => null);
        setVehicle(v);
      }

      const [driverShipments, driverDeliveries] = await Promise.all([
        shipmentService.getByDriverId(id).catch(() => []),
        deliveryService.getByDriverId(id).catch(() => []),
      ]);

      setShipments(driverShipments || []);
      setDeliveries(driverDeliveries || []);
    } catch (err) {
      console.error(err);
      error('Error', 'Failed to load driver profile');
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  useEffect(() => {
    fetchDriverData();
  }, [fetchDriverData]);

  if (loading && !driver) {
    return <LoadingSpinner fullPage message="Loading driver profile & operational history..." />;
  }

  if (!driver) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600">Driver not found.</p>
        <button
          onClick={() => navigate('/drivers')}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Back to Drivers
        </button>
      </div>
    );
  }

  const expiryDate = new Date(driver.licenseExpiry);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  const successRate = driver.totalDeliveries > 0
    ? Math.round(((driver.successfulDeliveries || 0) / driver.totalDeliveries) * 100)
    : 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Drivers', path: '/drivers' },
          { label: driver.name },
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/drivers')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {driver.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{driver.name}</h2>
                <StatusBadge status={driver.status} type="driver" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {driver.city} &bull; {driver.experienceYears} Years Commercial Driving
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/drivers/${driver.id}/edit`)}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <Edit className="w-4 h-4 mr-1.5" />
          Edit Driver
        </button>
      </div>

      {/* License Warning Banner if Expiring Soon */}
      {(isExpiringSoon || isExpired) && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs ${
            isExpired
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold">
              {isExpired ? 'COMMERCIAL LICENSE EXPIRED' : 'LICENSE EXPIRING SOON'}
            </span>
            <p className="mt-0.5">
              License #{driver.licenseNumber} {isExpired ? 'expired on' : 'expires on'}{' '}
              {expiryDate.toLocaleDateString()} ({daysUntilExpiry} days remaining). Please initiate renewal with transport authority.
            </p>
          </div>
        </div>
      )}

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-500">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{driver.performanceRating || 4.9}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Customer Rating / 5.0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{driver.totalDeliveries || 0}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Total Trips Completed</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{successRate}%</h3>
            <p className="text-xs text-slate-400 mt-0.5">Successful Delivery SLA</p>
          </div>
        </div>
      </div>

      {/* Driver Contact & Vehicle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-4 h-4 text-primary" />
            <span>Driver Credentials & Contact</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5" /> Mobile Phone
              </span>
              <span className="font-semibold text-slate-800">{driver.phone}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
              </span>
              <span className="font-semibold text-slate-800">{driver.email}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1.5" /> License Number
              </span>
              <span className="font-mono font-semibold text-slate-800">{driver.licenseNumber}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5" /> License Expiry
              </span>
              <span className="font-semibold text-slate-800">{expiryDate.toLocaleDateString()}</span>
            </div>
            <div className="py-2.5 flex items-start justify-between">
              <span className="text-slate-400 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Residence Address
              </span>
              <span className="font-semibold text-slate-800 text-right max-w-xs">{driver.address}</span>
            </div>
          </div>
        </div>

        {/* Assigned Vehicle */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-primary" />
            <span>Assigned Fleet Vehicle</span>
          </h3>

          {vehicle ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {vehicle.registrationNumber}
                  </span>
                  <p className="text-xs text-slate-500">
                    {vehicle.manufacturer} {vehicle.model} ({vehicle.type?.replace('_', ' ')})
                  </p>
                </div>
                <StatusBadge status={vehicle.status} type="vehicle" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Max Payload:</span>
                  <p className="font-semibold text-slate-800">{vehicle.maxWeightKg} kg</p>
                </div>
                <div>
                  <span className="text-slate-400">Fuel Type:</span>
                  <p className="font-semibold text-slate-800">{vehicle.fuelType}</p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/fleet/${vehicle.id}`)}
                className="w-full mt-2 py-1.5 text-xs font-semibold text-primary bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Inspect Vehicle Telemetry &rarr;
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No vehicle currently assigned to this driver.
            </div>
          )}
        </div>
      </div>

      {/* Active Consignments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Current Assigned Shipments ({shipments.length})</h3>
          <p className="text-xs text-slate-500">Shipments currently out on delivery with this driver</p>
        </div>

        <div className="divide-y divide-slate-100">
          {shipments.length > 0 ? (
            shipments.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/shipments/${s.id}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-primary font-mono">
                      #{s.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{s.customerName}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{s.deliveryAddress}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">{s.weightKg} kg</span>
                  <span className="block text-[11px] text-slate-400">{s.priority}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No active shipments currently on this driver's manifest.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
