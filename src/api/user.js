import api from "./axiosInstance";

export const changeBio = async (data) => {
  const res = await api.patch("/user/update-bio", data);
  return res.data;
};

export const changeName = async (data) => {
  const res = await api.patch("/user/update-name", data);
  return res.data;
};

export const changeUsername = async (data) => {
  const res = await api.patch("/user/update-username", data);
  return res.data;
};

export const changeEmail = async (data) => {
  const res = await api.patch("/user/update-email", data);
  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.patch("/user/update-password", data);
  return res.data;
};

export const changeAvatar = async (file) => {
  const formData = new FormData();
  formData.append("imageUrl", file);

  const res = await api.patch("/user/update-avatar", formData);
  return res.data;
};

export const changeBackground = async (file) => {
  const formData = new FormData();
  formData.append("bgUrl", file);

  const res = await api.patch("/user/update-background", formData);
  return res.data;
};

export const getProfile = async (username) => {
  const res = await api.get(`/user/${username}`);
  return res.data;
};

export const getCommentsByUser = async (username) => {
  const res = await api.get(`/user/${username}/comments`);
  return res.data;
};
