import api from './api';
import { ApiResponse, Shipment, ShipmentHistory, ShipmentStatus } from '../types';

export const shipmentService = {
  getAll: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Shipment[]> => {
    const res = await api.get<ApiResponse<Shipment[]>>('/shipments', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Shipment> => {
    const res = await api.get<ApiResponse<Shipment>>(`/shipments/${id}`);
    return res.data.data;
  },

  create: async (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment> => {
    const res = await api.post<ApiResponse<Shipment>>('/shipments', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Shipment>): Promise<Shipment> => {
    const res = await api.put<ApiResponse<Shipment>>(`/shipments/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/shipments/${id}`);
  },

  updateStatus: async (
    id: string,
    status: ShipmentStatus,
    remarks?: string
  ): Promise<Shipment> => {
    const res = await api.patch<ApiResponse<Shipment>>(`/shipments/${id}/status`, {
      status,
      remarks,
    });
    return res.data.data;
  },

  assign: async (
    id: string,
    assignment: { driverId?: string; vehicleId?: string; routeId?: string }
  ): Promise<Shipment> => {
    const res = await api.post<ApiResponse<Shipment>>(`/shipments/${id}/assign`, assignment);
    return res.data.data;
  },

  getHistory: async (id: string): Promise<ShipmentHistory[]> => {
    const res = await api.get<ApiResponse<ShipmentHistory[]>>(`/shipments/${id}/history`);
    return res.data.data;
  },

  getByDriverId: async (driverId: string): Promise<Shipment[]> => {
    const res = await api.get<ApiResponse<Shipment[]>>(`/shipments/driver/${driverId}`);
    return res.data.data;
  },
};
