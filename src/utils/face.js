// Where the Face ID scan pages live. Face login is hidden when this isn't configured (dev defaults to localhost).
export const faceClientUrl =
  import.meta.env.VITE_FACE_CLIENT_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "");
