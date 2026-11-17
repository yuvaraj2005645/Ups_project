import api from "./api";

export const deliveryService = {
  getAll: async (params) => {
    const res = await api.get("/deliveries", { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/deliveries/${id}`);
    return res.data.data;
  },
  create: async (data) => {
    const res = await api.post("/deliveries", data);
    return res.data.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/deliveries/${id}`, data);
    return res.data.data;
  },
  updateStatus: async (id, status, remarks, failureReason) => {
    const res = await api.patch(`/deliveries/${id}/status`, {
      status,
      remarks,
      failureReason
    });
    return res.data.data;
  },
  // Submit proof of delivery — field names match the backend ProofOfDeliveryRequest DTO
  submitProof: async (id, proofData) => {
    // proofData: { receiverName, signatureBase64, proofPhotoBase64, remarks }
    const res = await api.post(`/deliveries/${id}/proof`, proofData);
    return res.data.data;
  },
  getByDriverId: async (driverId) => {
    const res = await api.get("/deliveries", { params: { driverId } });
    return res.data.data;
  }
};
