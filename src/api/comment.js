import api from "./axiosInstance";

export const getCommentsByPost = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
};

export const getCommentThread = async (commentId) => {
  const res = await api.get(`/comments/${commentId}/thread`);
  return res.data;
};

export const createComment = async (
  postId,
  content,
  parentId = null,
  images = [],
) => {
  const formData = new FormData();
  formData.append("content", content);
  if (parentId) formData.append("parentId", parentId);
  images.forEach((image) => formData.append("images", image));

  const res = await api.post(`/posts/${postId}/comments`, formData);
  return res.data;
};
