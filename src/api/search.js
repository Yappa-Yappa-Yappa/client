import api from "./axiosInstance";

export const searchUserOrPost = async (query, { type, skip } = {}) => {
  const res = await api.get(`/search`, { params: { q: query, type, skip } });
  return res.data;
};
