import api from "./axiosInstance";

export const getCommentsByPost = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
};

export const getCommentThread = async (commentId) => {
  const res = await api.get(`/comments/${commentId}/thread`);
  return res.data;
};

export const createComment = async (postId, content, parentId = null) => {
  const res = await api.post(`/posts/${postId}/comments`, {
    content,
    ...(parentId ? { parentId } : {}),
  });
  return res.data;
};
