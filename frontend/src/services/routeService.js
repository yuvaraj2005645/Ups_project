import api from "./api";

export const routeService = {
  getAll: async (params) => {
    const res = await api.get("/routes", { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/routes/${id}`);
    return res.data.data;
  },
  create: async (data) => {
    const res = await api.post("/routes", data);
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/routes/${id}`, data);
    return res.data.data;
  },
  delete: async (id) => {
    await api.delete(`/routes/${id}`);
  },
  optimize: async (payload) => {
    const res = await api.post("/routes/optimize", payload);
    return res.data.data;
  },
  assign: async (routeId, payload) => {
    const res = await api.post(`/routes/${routeId}/assign`, payload);
    return res.data.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/routes/${id}/status`, { status });
    return res.data.data;
  },
  getByDriverId: async (driverId) => {
    const res = await api.get("/routes", { params: { driverId } });
    return res.data.data;
  }
};
