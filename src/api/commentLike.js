import api from "./axiosInstance";

export const likeComment = async (commentId) => {
  const res = await api.post(`/comments/${commentId}/like`);
  return res.data;
};

export const unlikeComment = async (commentId) => {
  const res = await api.delete(`/comments/${commentId}/like`);
  return res.data;
};
