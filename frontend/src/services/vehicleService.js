import api from "./api";
export const vehicleService = {
  getAll: async (params) => {
    const res = await api.get("/vehicles", { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/vehicles/${id}`);
    return res.data.data;
  },
  create: async (data) => {
    const res = await api.post("/vehicles", data);
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/vehicles/${id}`, data);
    return res.data.data;
  },
  delete: async (id) => {
    await api.delete(`/vehicles/${id}`);
  },
  getCapacity: async (id) => {
    const res = await api.get(`/vehicles/${id}/capacity`);
    return res.data.data;
  },
  allocate: async (criteria) => {
    const res = await api.post("/vehicles/allocate", criteria);
    return res.data.data;
  },
  confirmAllocation: async (payload) => {
    const res = await api.post("/vehicles/confirm-allocation", payload);
    return res.data.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/vehicles/${id}/status`, { status });
    return res.data.data;
  }
};
