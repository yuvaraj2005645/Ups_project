import api from "./api";
export const shipmentService = {
  getAll: async (params) => {
    const res = await api.get("/shipments", { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/shipments/${id}`);
    return res.data.data;
  },
  create: async (data) => {
    const res = await api.post("/shipments", data);
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/shipments/${id}`, data);
    return res.data.data;
  },
  delete: async (id) => {
    await api.delete(`/shipments/${id}`);
  },
  updateStatus: async (id, status, remarks) => {
    const res = await api.patch(`/shipments/${id}/status`, {
      status,
      remarks
    });
    return res.data.data;
  },
  assign: async (id, assignment) => {
    const res = await api.post(`/shipments/${id}/assign`, assignment);
    return res.data.data;
  },
  getHistory: async (id) => {
    const res = await api.get(`/shipments/${id}/history`);
    return res.data.data;
  },
  getByDriverId: async (driverId) => {
    const res = await api.get(`/shipments/driver/${driverId}`);
    return res.data.data;
  }
};
