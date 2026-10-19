import api from "./axiosInstance";

export const createReport = async ({ postId, reason, description }) => {
  const res = await api.post("/reports", {
    postId,
    reason,
    ...(description ? { description } : {}),
  });
  return res.data;
};
