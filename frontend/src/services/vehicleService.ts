import api from './api';
import { ApiResponse, Vehicle, VehicleCapacity, VehicleRecommendation } from '../types';

export const vehicleService = {
  getAll: async (params?: { status?: string; type?: string; search?: string }): Promise<Vehicle[]> => {
    const res = await api.get<ApiResponse<Vehicle[]>>('/vehicles', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Vehicle> => {
    const res = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return res.data.data;
  },

  create: async (data: Omit<Vehicle, 'id' | 'currentWeightKg' | 'currentVolumeM3'>): Promise<Vehicle> => {
    const res = await api.post<ApiResponse<Vehicle>>('/vehicles', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/vehicles/${id}`);
  },

  getCapacity: async (id: string): Promise<VehicleCapacity> => {
    const res = await api.get<ApiResponse<VehicleCapacity>>(`/vehicles/${id}/capacity`);
    return res.data.data;
  },

  allocate: async (criteria: {
    weightKg: number;
    volumeM3: number;
    priority?: string;
    vehicleType?: string;
  }): Promise<VehicleRecommendation[]> => {
    const res = await api.post<ApiResponse<VehicleRecommendation[]>>('/vehicles/allocate', criteria);
    return res.data.data;
  },

  confirmAllocation: async (payload: {
    vehicleId: string;
    shipmentIds?: string[];
    weightKg: number;
    volumeM3: number;
  }): Promise<VehicleCapacity> => {
    const res = await api.post<ApiResponse<VehicleCapacity>>('/vehicles/confirm-allocation', payload);
    return res.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<Vehicle> => {
    const res = await api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}/status`, { status });
    return res.data.data;
  },
};
