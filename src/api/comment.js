import api from "./axiosInstance";

export const getCommentsByPost = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
};

export const createComment = async (postId, content) => {
  const res = await api.post(`/posts/${postId}/comments`, { content });
  return res.data;
};
