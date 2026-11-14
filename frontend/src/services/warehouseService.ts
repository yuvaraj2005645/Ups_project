import api from './api';
import { ApiResponse, Shipment, Warehouse } from '../types';

export const warehouseService = {
  getAll: async (params?: { search?: string }): Promise<Warehouse[]> => {
    const res = await api.get<ApiResponse<Warehouse[]>>('/warehouses', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Warehouse> => {
    const res = await api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return res.data.data;
  },

  create: async (data: Omit<Warehouse, 'id'>): Promise<Warehouse> => {
    const res = await api.post<ApiResponse<Warehouse>>('/warehouses', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Warehouse>): Promise<Warehouse> => {
    const res = await api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/warehouses/${id}`);
  },

  getShipments: async (id: string): Promise<Shipment[]> => {
    const res = await api.get<ApiResponse<Shipment[]>>(`/warehouses/${id}/shipments`);
    return res.data.data;
  },
};
