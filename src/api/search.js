import api from "./axiosInstance";

export const searchUserOrPost = async (query) => {
  const res = await api.get(`/search`, { params: { q: query } });
  return res.data;
};
