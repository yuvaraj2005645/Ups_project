import api from "./api";
export const reportService = {
  getShipmentReport: async (params) => {
    const res = await api.get("/reports/shipments", { params });
    return res.data.data;
  },
  getVehicleReport: async (params) => {
    const res = await api.get("/reports/vehicles", { params });
    return res.data.data;
  },
  getRouteReport: async (params) => {
    const res = await api.get("/reports/routes", { params });
    return res.data.data;
  },
  getDriverReport: async (params) => {
    const res = await api.get("/reports/drivers", { params });
    return res.data.data;
  },
  getDeliveryReport: async (params) => {
    const res = await api.get("/reports/deliveries", { params });
    return res.data.data;
  },
  exportShipmentsCsv: async (params) => {
    const res = await api.get("/reports/shipments/export", {
      params,
      responseType: "blob"
    });
    return res.data;
  }
};
