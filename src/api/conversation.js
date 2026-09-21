import api from "./axiosInstance";

export const getConversations = async () => {
  const res = await api.get("/conversations");
  return res.data;
};

export const openDirectConversation = async (userId) => {
  const res = await api.post(`/conversations/direct/${userId}`);
  return res.data;
};

export const getConversationMessages = async (conversationId, page = 1, limit = 30) => {
  const res = await api.get(`/conversations/${conversationId}/messages`, { params: { page, limit } });
  return res.data;
};
