import api from "./axiosInstance";

export const deleteComment = async (commentId) => {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
};

export const updateComment = async (commentId, content) => {
  const res = await api.patch(`/comments/${commentId}`, { content });
  return res.data;
};
