import api from "./axiosInstance";

export const followUser = async (userId) => {
  const res = await api.post(`/follows/${userId}/follow`);
  return res.data;
};

export const unfollowUser = async (userId) => {
  const res = await api.delete(`/follows/${userId}/unfollow`);
  return res.data;
};
