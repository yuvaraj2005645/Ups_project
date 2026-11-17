import api from "./api";
export const warehouseService = {
  getAll: async (params) => {
    const res = await api.get("/warehouses", { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/warehouses/${id}`);
    return res.data.data;
  },
  create: async (data) => {
    const res = await api.post("/warehouses", data);
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/warehouses/${id}`, data);
    return res.data.data;
  },
  delete: async (id) => {
    await api.delete(`/warehouses/${id}`);
  },
  getShipments: async (id) => {
    const res = await api.get(`/warehouses/${id}/shipments`);
    return res.data.data;
  }
};
