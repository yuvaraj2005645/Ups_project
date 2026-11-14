import api from './api';
import { ApiResponse, Customer, Shipment } from '../types';

export const customerService = {
  getAll: async (params?: { search?: string; type?: string; active?: boolean }): Promise<Customer[]> => {
    const res = await api.get<ApiResponse<Customer[]>>('/customers', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },

  create: async (data: Omit<Customer, 'id' | 'registeredAt'>): Promise<Customer> => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/customers/${id}`);
  },

  getShipments: async (id: string): Promise<Shipment[]> => {
    const res = await api.get<ApiResponse<Shipment[]>>(`/customers/${id}/shipments`);
    return res.data.data;
  },
};
