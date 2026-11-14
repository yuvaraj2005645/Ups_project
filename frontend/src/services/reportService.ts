import api from './api';
import { ApiResponse } from '../types';

export interface ShipmentReportData {
  totalShipments: number;
  deliveredCount: number;
  delayedCount: number;
  cancelledCount: number;
  onTimeRate: number;
  shipmentsOverTime: { date: string; total: number; delivered: number; delayed: number }[];
  shipments: any[];
}

export interface VehicleReportData {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  avgUtilization: number;
  vehicleMetrics: {
    vehicleId: string;
    regNumber: string;
    type: string;
    tripsCompleted: number;
    weightUtilizationPct: number;
    volumeUtilizationPct: number;
    distanceCoveredKm: number;
  }[];
}

export interface RouteReportData {
  totalRoutes: number;
  totalDistanceKm: number;
  totalTimeMinutes: number;
  distanceSavedKm: number;
  timeSavedMinutes: number;
  overallImprovementPct: number;
  routeMetrics: {
    routeId: string;
    name: string;
    stopsCount: number;
    originalDistanceKm: number;
    optimizedDistanceKm: number;
    distanceSavedKm: number;
    timeSavedMin: number;
    driverName?: string;
  }[];
}

export interface DriverReportData {
  totalDrivers: number;
  activeDrivers: number;
  avgPerformanceRating: number;
  driverMetrics: {
    driverId: string;
    name: string;
    totalDeliveries: number;
    successfulDeliveries: number;
    successRate: number;
    performanceRating: number;
  }[];
}

export interface DeliveryReportData {
  totalDeliveries: number;
  deliveredCount: number;
  failedCount: number;
  returnedCount: number;
  successRate: number;
  statusDistribution: { status: string; count: number }[];
  deliveries: any[];
}

export const reportService = {
  getShipmentReport: async (params?: { startDate?: string; endDate?: string }): Promise<ShipmentReportData> => {
    const res = await api.get<ApiResponse<ShipmentReportData>>('/reports/shipments', { params });
    return res.data.data;
  },

  getVehicleReport: async (params?: { startDate?: string; endDate?: string }): Promise<VehicleReportData> => {
    const res = await api.get<ApiResponse<VehicleReportData>>('/reports/vehicles', { params });
    return res.data.data;
  },

  getRouteReport: async (params?: { startDate?: string; endDate?: string }): Promise<RouteReportData> => {
    const res = await api.get<ApiResponse<RouteReportData>>('/reports/routes', { params });
    return res.data.data;
  },

  getDriverReport: async (params?: { startDate?: string; endDate?: string }): Promise<DriverReportData> => {
    const res = await api.get<ApiResponse<DriverReportData>>('/reports/drivers', { params });
    return res.data.data;
  },

  getDeliveryReport: async (params?: { startDate?: string; endDate?: string }): Promise<DeliveryReportData> => {
    const res = await api.get<ApiResponse<DeliveryReportData>>('/reports/deliveries', { params });
    return res.data.data;
  },

  exportShipmentsCsv: async (params?: { startDate?: string; endDate?: string }): Promise<Blob> => {
    const res = await api.get('/reports/shipments/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};
