import api from "./axiosInstance";

export const favoriteComment = async (commentId) => {
  const res = await api.post(`/comments/${commentId}/favorite`);
  return res.data;
};

export const unfavoriteComment = async (commentId) => {
  const res = await api.delete(`/comments/${commentId}/favorite`);
  return res.data;
};
