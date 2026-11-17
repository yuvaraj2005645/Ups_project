import api from "./api";
export const dashboardService = {
  getOverview: async (range = "today") => {
    const res = await api.get("/dashboard/overview", {
      params: { range }
    });
    return res.data.data;
  }
};
