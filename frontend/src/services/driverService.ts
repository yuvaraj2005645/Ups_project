import api from './api';
import { ApiResponse, Driver } from '../types';

export const driverService = {
  getAll: async (params?: { status?: string; search?: string }): Promise<Driver[]> => {
    const res = await api.get<ApiResponse<Driver[]>>('/drivers', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Driver> => {
    const res = await api.get<ApiResponse<Driver>>(`/drivers/${id}`);
    return res.data.data;
  },

  create: async (data: Omit<Driver, 'id' | 'currentShipmentIds' | 'performanceRating' | 'totalDeliveries' | 'successfulDeliveries'>): Promise<Driver> => {
    const res = await api.post<ApiResponse<Driver>>('/drivers', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Driver>): Promise<Driver> => {
    const res = await api.put<ApiResponse<Driver>>(`/drivers/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/drivers/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<Driver> => {
    const res = await api.patch<ApiResponse<Driver>>(`/drivers/${id}/status`, { status });
    return res.data.data;
  },

  assignVehicle: async (driverId: string, vehicleId: string): Promise<Driver> => {
    const res = await api.post<ApiResponse<Driver>>(`/drivers/${driverId}/assign-vehicle`, { vehicleId });
    return res.data.data;
  },

  getAvailable: async (): Promise<Driver[]> => {
    const res = await api.get<ApiResponse<Driver[]>>('/drivers/available');
    return res.data.data;
  },
};
