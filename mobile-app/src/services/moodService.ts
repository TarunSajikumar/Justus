import { api } from "./api";

export const moodService = {
  saveMood: async (mood: string) => {
    const response = await api.post("/moods", { mood });
    return response.data;
  },

  getPartnerMood: async () => {
    const response = await api.get("/moods/partner");
    return response.data;
  },
};
