import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Edit,
  User,
  Package,
  Wrench,
  CheckCircle2,
  Calendar,
  Fuel,
  Cpu,
} from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { shipmentService } from '../../services/shipmentService';
import { Vehicle, Driver, Shipment } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ProgressBar } from '../../components/ProgressBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useToast } from '../../components/Toast';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicleDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const v = await vehicleService.getById(id);
      setVehicle(v);

      if (v.driverId) {
        const d = await driverService.getById(v.driverId).catch(() => null);
        setDriver(d);
      }

      // Load shipments assigned to this vehicle
      const allShipments = await shipmentService.getAll().catch(() => []);
      setShipments(allShipments.filter((s) => s.vehicleId === id));
    } catch (err) {
      console.error(err);
      error('Error', 'Unable to load vehicle details.');
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  const handleMaintenanceToggle = async () => {
    if (!vehicle) return;
    const nextStatus = vehicle.status === 'UNDER_MAINTENANCE' ? 'AVAILABLE' : 'UNDER_MAINTENANCE';
    try {
      const updated = await vehicleService.updateStatus(vehicle.id, nextStatus);
      setVehicle(updated);
      success('Status Updated', `Vehicle status changed to ${nextStatus}`);
    } catch (err: any) {
      error('Failed', err.response?.data?.message || 'Could not change status');
    }
  };

  if (loading && !vehicle) {
    return <LoadingSpinner fullPage message="Loading vehicle specifications & load telemetry..." />;
  }

  if (!vehicle) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600">Vehicle not found.</p>
        <button
          onClick={() => navigate('/fleet')}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Back to Fleet
        </button>
      </div>
    );
  }

  const weightPct = vehicle.maxWeightKg > 0
    ? Math.round(((vehicle.currentWeightKg || 0) / vehicle.maxWeightKg) * 100)
    : 0;

  const volumePct = vehicle.maxVolumeM3 > 0
    ? Math.round(((vehicle.currentVolumeM3 || 0) / vehicle.maxVolumeM3) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Fleet', path: '/fleet' },
          { label: vehicle.registrationNumber },
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/fleet')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {vehicle.registrationNumber}
              </h2>
              <StatusBadge status={vehicle.status} type="vehicle" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {vehicle.manufacturer} {vehicle.model} ({vehicle.year}) &bull; {vehicle.type?.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate(`/fleet/allocate?vehicleId=${vehicle.id}`)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 transition-colors"
          >
            <Cpu className="w-4 h-4 mr-1.5" />
            Allocate Load
          </button>
          <button
            onClick={handleMaintenanceToggle}
            className={`inline-flex items-center px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              vehicle.status === 'UNDER_MAINTENANCE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Wrench className="w-4 h-4 mr-1.5" />
            {vehicle.status === 'UNDER_MAINTENANCE' ? 'Mark Available' : 'Send to Maintenance'}
          </button>
          <button
            onClick={() => navigate(`/fleet/${vehicle.id}/edit`)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-1.5" />
            Edit
          </button>
        </div>
      </div>

      {/* LARGE Capacity Display Panel */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Live Payload & Volumetric Capacity Utilization
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry of loaded consignments against certified vehicle rating
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
          {/* Weight */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Gross Payload Weight
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {vehicle.currentWeightKg || 0} / {vehicle.maxWeightKg} kg ({weightPct}%)
              </span>
            </div>
            <ProgressBar
              value={vehicle.currentWeightKg || 0}
              max={vehicle.maxWeightKg}
              showPercent={false}
              size="lg"
            />
            <p className="text-[11px] text-slate-500">
              Remaining capacity:{' '}
              <span className="font-bold text-slate-700">
                {Math.max(0, vehicle.maxWeightKg - (vehicle.currentWeightKg || 0))} kg
              </span>
            </p>
          </div>

          {/* Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Usable Cargo Volume
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {vehicle.currentVolumeM3 || 0} / {vehicle.maxVolumeM3} m&sup3; ({volumePct}%)
              </span>
            </div>
            <ProgressBar
              value={vehicle.currentVolumeM3 || 0}
              max={vehicle.maxVolumeM3}
              showPercent={false}
              size="lg"
            />
            <p className="text-[11px] text-slate-500">
              Remaining volume:{' '}
              <span className="font-bold text-slate-700">
                {Math.max(0, Number((vehicle.maxVolumeM3 - (vehicle.currentVolumeM3 || 0)).toFixed(2)))} m&sup3;
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Driver & Asset Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Driver Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-4 h-4 text-primary" />
            <span>Assigned Driver</span>
          </h3>

          {driver ? (
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                {driver.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900">{driver.name}</h4>
                <p className="text-xs text-slate-500">{driver.phone} &bull; {driver.email}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                    License: {driver.licenseNumber}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    ★ {driver.performanceRating}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/drivers/${driver.id}`)}
                  className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  View Driver Profile &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No driver currently assigned to this vehicle.
            </div>
          )}
        </div>

        {/* Vehicle Metadata */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Fuel className="w-4 h-4 text-primary" />
            <span>Technical & Service Record</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Fuel Type</span>
              <span className="font-semibold text-slate-700">{vehicle.fuelType}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Exterior Color</span>
              <span className="font-semibold text-slate-700">{vehicle.color}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Model Year</span>
              <span className="font-semibold text-slate-700">{vehicle.year}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Next Scheduled Maintenance</span>
              <span className="font-semibold text-slate-700">
                {vehicle.maintenanceDue ? new Date(vehicle.maintenanceDue).toLocaleDateString() : 'Up to date'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Currently Loaded Shipments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Consignments ({shipments.length})</h3>
            <p className="text-xs text-slate-500">Packages currently loaded in this vehicle</p>
          </div>
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
                  <span className="block text-[11px] text-slate-400">{s.volumeM3} m&sup3;</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No active shipments loaded. Vehicle cargo bay is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
