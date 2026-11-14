import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Truck } from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types';
import { useToast } from '../../components/Toast';
import { Breadcrumb } from '../../components/Breadcrumb';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(3, 'Registration number is required'),
  manufacturer: z.string().min(2, 'Manufacturer name is required'),
  model: z.string().min(1, 'Model is required'),
  type: z.enum([
    'MINI_TRUCK',
    'DELIVERY_VAN',
    'PICKUP_TRUCK',
    'HEAVY_TRUCK',
    'CONTAINER_TRUCK',
  ] as const),
  maxWeightKg: z.number().min(50, 'Max weight must be at least 50 kg'),
  maxVolumeM3: z.number().min(0.5, 'Max volume must be at least 0.5 m³'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Color is required'),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'UNDER_MAINTENANCE', 'INACTIVE'] as const),
  maintenanceDue: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export const EditVehiclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  useEffect(() => {
    if (!id) return;
    const fetchVehicle = async () => {
      try {
        const data = await vehicleService.getById(id);
        reset({
          registrationNumber: data.registrationNumber,
          manufacturer: data.manufacturer,
          model: data.model,
          type: data.type,
          maxWeightKg: data.maxWeightKg,
          maxVolumeM3: data.maxVolumeM3,
          fuelType: data.fuelType,
          year: data.year,
          color: data.color,
          status: data.status,
          maintenanceDue: data.maintenanceDue || '',
        });
      } catch (err) {
        error('Not Found', 'Vehicle could not be loaded.');
        navigate('/fleet');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, reset, error, navigate]);

  const onSubmit = async (data: VehicleFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await vehicleService.update(id, data);
      success('Updated', `Vehicle ${data.registrationNumber} updated successfully.`);
      navigate(`/fleet/${id}`);
    } catch (err: any) {
      console.error(err);
      error('Update failed', err.response?.data?.message || 'Could not update vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading vehicle specifications..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Fleet', path: '/fleet' },
          { label: 'Edit Vehicle' },
        ]}
      />

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/fleet')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Fleet Vehicle</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify asset parameters, load limits, and service lifecycle dates.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <Truck className="w-4 h-4 text-primary" />
            <span>Vehicle Specifications & Capacity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registration Number
              </label>
              <input
                type="text"
                {...register('registrationNumber')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 uppercase"
              />
              {errors.registrationNumber && (
                <p className="text-xs text-rose-500 mt-1">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Manufacturer</label>
              <input
                type="text"
                {...register('manufacturer')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Model</label>
              <input
                type="text"
                {...register('model')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vehicle Type</label>
              <select
                {...register('type')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              >
                <option value="MINI_TRUCK">Mini Truck</option>
                <option value="DELIVERY_VAN">Delivery Van</option>
                <option value="PICKUP_TRUCK">Pickup Truck</option>
                <option value="HEAVY_TRUCK">Heavy Truck</option>
                <option value="CONTAINER_TRUCK">Container Truck</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Weight (Kg)
              </label>
              <input
                type="number"
                {...register('maxWeightKg', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Volume (m&sup3;)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('maxVolumeM3', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fuel Type</label>
              <input
                type="text"
                {...register('fuelType')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maintenance Due Date
              </label>
              <input
                type="date"
                {...register('maintenanceDue')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/fleet')}
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
                <span>Update Vehicle</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
