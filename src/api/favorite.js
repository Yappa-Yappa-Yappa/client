import api from "./axiosInstance";

export const addFavorite = async (postId) => {
  const res = await api.post(`/posts/${postId}/favorite`);
  return res.data;
};

export const getFavorites = async () => {
  const res = await api.get("/posts/user/favorites");
  return res.data;
};

export const removeFavorite = async (postId) => {
  const res = await api.delete(`/posts/${postId}/favorite`);
  return res.data;
};
