import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Truck } from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { VehicleType, VehicleStatus } from '../../types';
import { useToast } from '../../components/Toast';
import { Breadcrumb } from '../../components/Breadcrumb';

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

export const AddVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: '',
      manufacturer: 'Tata Motors',
      model: 'Ace Gold',
      type: 'MINI_TRUCK',
      maxWeightKg: 1000,
      maxVolumeM3: 5.5,
      fuelType: 'Diesel',
      year: new Date().getFullYear(),
      color: 'White',
      status: 'AVAILABLE',
      maintenanceDue: '',
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      const created = await vehicleService.create(data);
      success('Vehicle Registered', `Vehicle ${created.registrationNumber} added to fleet!`);
      navigate(`/fleet/${created.id}`);
    } catch (err: any) {
      console.error(err);
      error('Registration Failed', err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Fleet', path: '/fleet' },
          { label: 'Add Vehicle' },
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Fleet Vehicle</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register transport asset specifications, gross payload weight, and capacity limits.
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
                Registration Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('registrationNumber')}
                placeholder="e.g. TN-01-AB-1234"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 uppercase"
              />
              {errors.registrationNumber && (
                <p className="text-xs text-rose-500 mt-1">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Manufacturer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('manufacturer')}
                placeholder="e.g. Tata, Mahindra, Ashok Leyland"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
              {errors.manufacturer && (
                <p className="text-xs text-rose-500 mt-1">{errors.manufacturer.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Model Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('model')}
                placeholder="e.g. 407 Gold, Bolero Maxi Truck"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
              {errors.model && <p className="text-xs text-rose-500 mt-1">{errors.model.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Vehicle Type <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('type')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              >
                <option value="MINI_TRUCK">Mini Truck (&lt; 1.5T)</option>
                <option value="DELIVERY_VAN">Delivery Van</option>
                <option value="PICKUP_TRUCK">Pickup Truck</option>
                <option value="HEAVY_TRUCK">Heavy Truck (10T - 16T)</option>
                <option value="CONTAINER_TRUCK">Container Truck (&gt; 20T)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maximum Weight (Kg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                {...register('maxWeightKg', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
              {errors.maxWeightKg && (
                <p className="text-xs text-rose-500 mt-1">{errors.maxWeightKg.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maximum Volume (m&sup3;) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                {...register('maxVolumeM3', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
              {errors.maxVolumeM3 && (
                <p className="text-xs text-rose-500 mt-1">{errors.maxVolumeM3.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fuel Type</label>
              <select
                {...register('fuelType')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              >
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric (EV)</option>
                <option value="Petrol">Petrol</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Manufacturing Year
              </label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vehicle Color</label>
              <input
                type="text"
                {...register('color')}
                placeholder="e.g. Polar White"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Initial Status</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              >
                <option value="AVAILABLE">Available</option>
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
                <span>Save Vehicle</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
