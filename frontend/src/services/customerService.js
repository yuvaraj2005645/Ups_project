import api from "./api";
export const customerService = {
  getAll: async (params) => {
    const res = await api.get("/customers", { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/customers/${id}`);
    return res.data.data;
  },
  create: async (data) => {
    const res = await api.post("/customers", data);
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/customers/${id}`, data);
    return res.data.data;
  },
  delete: async (id) => {
    await api.delete(`/customers/${id}`);
  },
  getShipments: async (id) => {
    const res = await api.get(`/customers/${id}/shipments`);
    return res.data.data;
  }
};
