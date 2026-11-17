import api from "./api";
export const notificationService = {
  getAll: async (params) => {
    const res = await api.get("/notifications", { params });
    return res.data.data;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllAsRead: async () => {
    await api.patch("/notifications/read-all");
  },
  getUnreadCount: async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data.data.count;
  }
};
