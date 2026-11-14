import api from './api';
import { ApiResponse, Route, RouteOptimizationResult, RouteStop } from '../types';

export const routeService = {
  getAll: async (params?: { status?: string; search?: string }): Promise<Route[]> => {
    const res = await api.get<ApiResponse<Route[]>>('/routes', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Route> => {
    const res = await api.get<ApiResponse<Route>>(`/routes/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Route>): Promise<Route> => {
    const res = await api.post<ApiResponse<Route>>('/routes', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Route>): Promise<Route> => {
    const res = await api.put<ApiResponse<Route>>(`/routes/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/routes/${id}`);
  },

  optimize: async (payload: {
    originLat: number;
    originLng: number;
    originAddress?: string;
    warehouseId?: string;
    stops: RouteStop[];
  }): Promise<RouteOptimizationResult> => {
    const res = await api.post<ApiResponse<RouteOptimizationResult>>('/routes/optimize', payload);
    return res.data.data;
  },

  assign: async (
    routeId: string,
    payload: { driverId: string; vehicleId: string }
  ): Promise<Route> => {
    const res = await api.post<ApiResponse<Route>>(`/routes/${routeId}/assign`, payload);
    return res.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<Route> => {
    const res = await api.patch<ApiResponse<Route>>(`/routes/${id}/status`, { status });
    return res.data.data;
  },

  getByDriverId: async (driverId: string): Promise<Route[]> => {
    const res = await api.get<ApiResponse<Route[]>>(`/routes/driver/${driverId}`);
    return res.data.data;
  },
};
