import axios from "axios";

const quizzy = axios.create({
  baseURL: `${import.meta.env.VITE_QUIZZY_URL}/api`,
});

export const getTopics = async () => {
  const res = await quizzy.get(`/topics`);
  return res.data;
};

export const getTopicById = async (id) => {
  const res = await quizzy.get(`/topics/${id}`);
  return res.data;
};
