import api from "./api";

export const driverService = {
  getAll: async (params) => {
    const res = await api.get("/drivers", { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/drivers/${id}`);
    return res.data.data;
  },
  // Get the authenticated driver's own profile
  getMe: async () => {
    const res = await api.get("/drivers/me");
    return res.data.data;
  },
  // Update own phone/address/city
  updateMe: async (data) => {
    const res = await api.patch("/drivers/me", data);
    return res.data.data;
  },
  create: async (data) => {
    const res = await api.post("/drivers", data);
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/drivers/${id}`, data);
    return res.data.data;
  },
  delete: async (id) => {
    await api.delete(`/drivers/${id}`);
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/drivers/${id}/status`, { status });
    return res.data.data;
  },
  assignVehicle: async (driverId, vehicleId) => {
    const res = await api.post(`/drivers/${driverId}/assign-vehicle`, { vehicleId });
    return res.data.data;
  },
  getAvailable: async () => {
    const res = await api.get("/drivers/available");
    return res.data.data;
  },
  getDriverShipments: async (driverId) => {
    const res = await api.get(`/drivers/${driverId}/shipments`);
    return res.data.data;
  }
};
