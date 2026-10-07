import api from "./axiosInstance";

export const repostPost = async (postId) => {
  const res = await api.post(`/posts/${postId}/repost`);
  return res.data;
};

export const removeRepost = async (postId) => {
  const res = await api.delete(`/posts/${postId}/repost`);
  return res.data;
};

export const getRepostStatus = async (postId) => {
  const res = await api.get(`/posts/${postId}/repost/status`);
  return res.data;
};

export const getRepostsByUser = async (username) => {
  const res = await api.get(`/posts/user/${username}/reposts`);
  return res.data;
};
