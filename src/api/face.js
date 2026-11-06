import api from "./axiosInstance";

export const getFaceStatus = async () => {
  const res = await api.get("/face/status");
  return res.data;
};

// Returns { data: { url } }: the Face ID scan page for this user.
// Setting up or replacing a face needs the account password.
export const getFaceSetupLink = async (password) => {
  const res = await api.post("/face/setup", { password });
  return res.data;
};
