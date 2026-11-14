import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, User } from 'lucide-react';
import { driverService } from '../../services/driverService';
import { useToast } from '../../components/Toast';
import { Breadcrumb } from '../../components/Breadcrumb';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const driverSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  licenseNumber: z.string().min(4, 'Valid driver license number is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  experienceYears: z.number().min(0, 'Experience years must be positive'),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'ON_DELIVERY', 'ON_LEAVE', 'INACTIVE'] as const),
});

type DriverFormData = z.infer<typeof driverSchema>;

export const EditDriverPage: React.FC = () => {
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
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
  });

  useEffect(() => {
    if (!id) return;
    const fetchDriver = async () => {
      try {
        const d = await driverService.getById(id);
        reset({
          name: d.name,
          email: d.email,
          phone: d.phone,
          address: d.address,
          city: d.city,
          licenseNumber: d.licenseNumber,
          licenseExpiry: d.licenseExpiry,
          experienceYears: d.experienceYears,
          status: d.status,
        });
      } catch (err) {
        error('Error', 'Driver profile could not be loaded');
        navigate('/drivers');
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id, reset, error, navigate]);

  const onSubmit = async (data: DriverFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await driverService.update(id, data);
      success('Driver Updated', `Profile of ${data.name} updated.`);
      navigate(`/drivers/${id}`);
    } catch (err: any) {
      console.error(err);
      error('Update failed', err.response?.data?.message || 'Could not update driver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading driver profile..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Drivers', path: '/drivers' },
          { label: 'Edit Driver' },
        ]}
      />

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/drivers')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Driver Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update license credentials, contact numbers, and working availability.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-primary" />
            <span>Driver Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
              <input
                type="text"
                {...register('phone')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Base City</label>
              <input
                type="text"
                {...register('city')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
              <textarea
                rows={2}
                {...register('address')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                License Number
              </label>
              <input
                type="text"
                {...register('licenseNumber')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                License Expiration Date
              </label>
              <input
                type="date"
                {...register('licenseExpiry')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                {...register('experienceYears', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="ON_DELIVERY">On Delivery</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/drivers')}
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
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
