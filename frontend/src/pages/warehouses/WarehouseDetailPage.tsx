import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Warehouse as WarehouseIcon,
  MapPin,
  Truck,
  Package,
  Layers,
  Box,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { warehouseService } from '../../services/warehouseService';
import { vehicleService } from '../../services/vehicleService';
import { shipmentService } from '../../services/shipmentService';
import { Warehouse, Vehicle, Shipment } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ProgressBar } from '../../components/ProgressBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useToast } from '../../components/Toast';

const customPin = L.divIcon({
  className: 'custom-leaflet-pin',
  html: `<div style="
    background-color: #2563EB;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    border: 2px solid white;
  ">WH</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const WarehouseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error } = useToast();

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWarehouseData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [w, vList, sList] = await Promise.all([
        warehouseService.getById(id),
        vehicleService.getAll().catch(() => []),
        shipmentService.getAll().catch(() => []),
      ]);
      setWarehouse(w);
      // Filter vehicles stationed here or matching city
      setVehicles(vList.filter((v) => v.status === 'AVAILABLE'));
      setShipments(sList.filter((s) => s.warehouseId === id));
    } catch (err) {
      console.error(err);
      error('Error', 'Failed to load warehouse facility');
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  if (loading && !warehouse) {
    return <LoadingSpinner fullPage message="Loading warehouse specifications..." />;
  }

  if (!warehouse) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600">Warehouse hub not found.</p>
        <button
          onClick={() => navigate('/warehouses')}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Back to Warehouses
        </button>
      </div>
    );
  }

  const centerCoord: [number, number] = [warehouse.lat || 13.0827, warehouse.lng || 80.2707];
  const usedPct = warehouse.totalCapacityM3 > 0
    ? Math.round((warehouse.occupiedCapacityM3 / warehouse.totalCapacityM3) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Warehouses', path: '/warehouses' },
          { label: warehouse.name },
        ]}
      />

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/warehouses')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center font-bold text-lg">
            <WarehouseIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{warehouse.name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {warehouse.address}, {warehouse.city}, {warehouse.state}
            </p>
          </div>
        </div>
      </div>

      {/* Storage Volumetric Capacity Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-baseline">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Storage Bay Volumetric Utilization</h3>
            <p className="text-xs text-slate-400">Total cross-docking pallets capacity</p>
          </div>
          <span className="text-lg font-extrabold text-slate-900 font-mono">
            {warehouse.occupiedCapacityM3} / {warehouse.totalCapacityM3} m&sup3; ({usedPct}%)
          </span>
        </div>

        <ProgressBar
          value={warehouse.occupiedCapacityM3}
          max={warehouse.totalCapacityM3}
          showPercent={false}
          size="lg"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-0.5">Total Capacity</span>
            <span className="font-bold text-slate-800">{warehouse.totalCapacityM3} m&sup3;</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-0.5">Allocated Storage</span>
            <span className="font-bold text-slate-800">{warehouse.occupiedCapacityM3} m&sup3;</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-0.5">Available Headroom</span>
            <span className="font-bold text-emerald-700">
              {Math.max(0, warehouse.totalCapacityM3 - warehouse.occupiedCapacityM3)} m&sup3;
            </span>
          </div>
        </div>
      </div>

      {/* Map & Stationed Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaflet Location Pin Map */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Geographic Hub Location</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {warehouse.lat}, {warehouse.lng}
            </span>
          </div>
          <div className="h-72 w-full flex-1">
            <MapContainer
              center={centerCoord}
              zoom={13}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={centerCoord} icon={customPin}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{warehouse.name}</p>
                    <p>{warehouse.address}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Stationed Fleet Vehicles */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Stationed Vehicles ({vehicles.length})</span>
            </h3>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
            {vehicles.length > 0 ? (
              vehicles.slice(0, 6).map((v) => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/fleet/${v.id}`)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {v.registrationNumber}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {v.manufacturer} {v.model} ({v.type?.replace('_', ' ')})
                    </span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={v.status} type="vehicle" />
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Max {v.maxWeightKg} kg
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-xs text-slate-400">
                No vehicles currently docked at this warehouse.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
