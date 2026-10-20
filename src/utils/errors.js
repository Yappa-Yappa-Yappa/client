// Returns the server's rate-limit message on a 429, otherwise the fallback.
export const getRateLimitMessage = (error, fallback) =>
  error?.response?.status === 429
    ? error.response.data?.message || fallback
    : fallback;
