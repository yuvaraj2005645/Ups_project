import api from './api';
import { ApiResponse, DashboardOverview } from '../types';

export const dashboardService = {
  getOverview: async (range: string = 'today'): Promise<DashboardOverview> => {
    const res = await api.get<ApiResponse<DashboardOverview>>('/dashboard/overview', {
      params: { range },
    });
    return res.data.data;
  },
};
