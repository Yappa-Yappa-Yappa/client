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

export const getPlayQuestions = async (topicId) => {
  const res = await quizzy.get(`/questions/t/${topicId}/play`);
  return res.data;
};

export const submitAnswer = async (questionId, answer) => {
  const res = await quizzy.post(`/questions/${questionId}/answer`, { answer });
  return res.data;
};
