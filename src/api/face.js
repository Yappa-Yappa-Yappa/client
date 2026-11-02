import api from "./axiosInstance";

export const getFaceStatus = async () => {
  const res = await api.get("/face/status");
  return res.data;
};

// Returns { data: { url } }: the Face ID scan page for this user.
export const getFaceSetupLink = async () => {
  const res = await api.post("/face/setup");
  return res.data;
};
