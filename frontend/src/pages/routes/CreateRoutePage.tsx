import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Plus, Trash2, MapPin, Navigation } from 'lucide-react';
import { routeService } from '../../services/routeService';
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { Vehicle, Driver } from '../../types';
import { useToast } from '../../components/Toast';
import { Breadcrumb } from '../../components/Breadcrumb';

const waypointSchema = z.object({
  address: z.string().min(2, 'Waypoint address required'),
  lat: z.number(),
  lng: z.number(),
  sequenceOrder: z.number(),
});

const routeSchema = z.object({
  name: z.string().min(2, 'Route name is required'),
  originAddress: z.string().min(2, 'Origin address is required'),
  originLat: z.number(),
  originLng: z.number(),
  destinationAddress: z.string().min(2, 'Destination address is required'),
  destinationLat: z.number(),
  destinationLng: z.number(),
  totalDistanceKm: z.number().min(1, 'Distance must be at least 1 km'),
  estimatedDurationMin: z.number().min(1, 'Duration must be at least 1 min'),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  waypoints: z.array(waypointSchema),
});

type RouteFormData = z.infer<typeof routeSchema>;

export const CreateRoutePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: 'Chennai Central - Bengaluru Tech Corridor',
      originAddress: 'Chennai Central Logistics Hub, Chennai, Tamil Nadu',
      originLat: 13.0827,
      originLng: 80.2707,
      destinationAddress: 'Electronic City Delivery Depot, Bengaluru, Karnataka',
      destinationLat: 12.8452,
      destinationLng: 77.6602,
      totalDistanceKm: 345,
      estimatedDurationMin: 360,
      vehicleId: '',
      driverId: '',
      waypoints: [
        {
          address: 'Vellore Highway Rest Stop, Vellore',
          lat: 12.9165,
          lng: 79.1325,
          sequenceOrder: 1,
        },
        {
          address: 'Hosur Industrial Transit Hub, Hosur',
          lat: 12.7409,
          lng: 77.8253,
          sequenceOrder: 2,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'waypoints',
  });

  useEffect(() => {
    const fetchPrereqs = async () => {
      try {
        const [vList, dList] = await Promise.all([
          vehicleService.getAll().catch(() => []),
          driverService.getAll().catch(() => []),
        ]);
        setVehicles(vList || []);
        setDrivers(dList || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrereqs();
  }, []);

  const onSubmit = async (data: RouteFormData) => {
    setIsSubmitting(true);
    try {
      const created = await routeService.create({
        ...data,
        status: 'PLANNED',
      });
      success('Route Created', `Route "${created.name}" created successfully!`);
      navigate(`/routes/${created.id}`);
    } catch (err: any) {
      console.error(err);
      error('Creation Failed', err.response?.data?.message || 'Could not create route.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Routes', path: '/routes' },
          { label: 'Create Route' },
        ]}
      />

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/routes')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Plan New Delivery Route</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure transit route origins, stops, mileage estimations, and driver allocations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Route Specs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <Navigation className="w-4 h-4 text-primary" />
            <span>Route Identification & Vehicle Allocation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Route Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Chennai - Bengaluru Express Corridor"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Vehicle
              </label>
              <select
                {...register('vehicleId')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              >
                <option value="">-- Optional Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} ({v.type?.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Driver
              </label>
              <select
                {...register('driverId')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              >
                <option value="">-- Optional Driver --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Est. Km <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('totalDistanceKm', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Est. Min <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('estimatedDurationMin', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Origin & Destination */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Terminal Endpoints</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Origin Address
              </span>
              <textarea
                rows={2}
                {...register('originAddress')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Lat"
                  {...register('originLat', { valueAsNumber: true })}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Lng"
                  {...register('originLng', { valueAsNumber: true })}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Destination Address
              </span>
              <textarea
                rows={2}
                {...register('destinationAddress')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Lat"
                  {...register('destinationLat', { valueAsNumber: true })}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Lng"
                  {...register('destinationLng', { valueAsNumber: true })}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Waypoints */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Waypoints & Stops ({fields.length})</span>
            </div>
            <button
              type="button"
              onClick={() =>
                append({
                  address: '',
                  lat: 13.0,
                  lng: 80.0,
                  sequenceOrder: fields.length + 1,
                })
              }
              className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Stop
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-3"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Stop address or landmark"
                      {...register(`waypoints.${index}.address` as const)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Lat"
                      {...register(`waypoints.${index}.lat` as const, { valueAsNumber: true })}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Lng"
                      {...register(`waypoints.${index}.lng` as const, { valueAsNumber: true })}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/routes')}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Route</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
