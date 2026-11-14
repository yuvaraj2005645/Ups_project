import api from './api';
import { ApiResponse, Delivery, DeliveryStatus } from '../types';

export const deliveryService = {
  getAll: async (params?: {
    status?: string;
    driverId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Delivery[]> => {
    const res = await api.get<ApiResponse<Delivery[]>>('/deliveries', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Delivery> => {
    const res = await api.get<ApiResponse<Delivery>>(`/deliveries/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Delivery>): Promise<Delivery> => {
    const res = await api.post<ApiResponse<Delivery>>('/deliveries', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Delivery>): Promise<Delivery> => {
    const res = await api.put<ApiResponse<Delivery>>(`/deliveries/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (
    id: string,
    status: DeliveryStatus,
    remarks?: string
  ): Promise<Delivery> => {
    const res = await api.patch<ApiResponse<Delivery>>(`/deliveries/${id}/status`, {
      status,
      remarks,
    });
    return res.data.data;
  },

  submitProof: async (
    id: string,
    proofData: {
      receiverName: string;
      signatureBase64?: string;
      photoBase64?: string;
      remarks?: string;
    }
  ): Promise<Delivery> => {
    const res = await api.post<ApiResponse<Delivery>>(`/deliveries/${id}/proof`, proofData);
    return res.data.data;
  },

  getByDriverId: async (driverId: string): Promise<Delivery[]> => {
    const res = await api.get<ApiResponse<Delivery[]>>(`/deliveries/driver/${driverId}`);
    return res.data.data;
  },
};
