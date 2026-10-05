import api from "./axiosInstance";

export const postFeed = async (data) => {
  const res = await api.post("/posts", data);
  return res.data;
};

export const getFeeds = async (page = 1, limit = 20) => {
  const res = await api.get("/posts", { params: { page, limit } });
  return res.data;
};

export const getPostsByUser = async (userId, page = 1, limit = 20) => {
  const res = await api.get("/posts", {
    params: { userId, page, limit },
  });
  return res.data;
};

export const getFeedById = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const incrementView = async (id) => {
  const res = await api.patch(`/posts/${id}`);
  return res.data;
};

export const editFeed = async (id, data) => {
  const res = await api.put(`/posts/${id}`, data);
  return res.data;
};

export const deleteFeed = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};

export const getTrendingPosts = async (limit = 3) => {
  const res = await api.get("/posts/trending", {
    params: { limit },
  });

  return res.data;
};
