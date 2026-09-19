import api from "./axiosInstance";

export const changeBio = async (data) => {
  const res = await api.patch("/user/update-bio", data);
  return res.data;
};

export const getProfile = async (username) => {
  const res = await api.get(`/user/${username}`);
  return res.data;
};
