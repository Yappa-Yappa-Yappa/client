import { useCallback, useState } from "react";
import { getFaceSetupLink } from "../api/face";
import FaceFrameModal from "../components/FaceFrameModal";
import FacePasswordModal from "../components/FacePasswordModal";
import { useTheme } from "../contexts/ThemeContext";
import { showSuccessToast } from "../utils/toast";

// Opens the Face ID setup scan in a popup, after asking for the account password (so an open session alone
// cannot register or replace a face). Render `modal` somewhere in your component; call `start` on click.
export function useFaceSetup({ onDone }) {
  const { theme } = useTheme();
  const [askPassword, setAskPassword] = useState(false);
  const [frameSrc, setFrameSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = () => {
    setError("");
    setAskPassword(true);
  };

  const submitPassword = async (password) => {
    setLoading(true);
    setError("");
    try {
      const res = await getFaceSetupLink(password);
      const url = new URL(res.data.url);
      url.searchParams.set("embed", "1");
      url.searchParams.set("parent", window.location.origin);
      url.searchParams.set("theme", theme);
      setAskPassword(false);
      setFrameSrc(url.toString());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Face ID isn't available right now",
      );
    } finally {
      setLoading(false);
    }
  };

  const closePassword = useCallback(() => {
    setAskPassword(false);
    setError("");
  }, []);

  const close = useCallback(() => setFrameSrc(""), []);

  const handleMessage = useCallback(
    (data) => {
      if (data?.type !== "face-enrolled") return;
      setFrameSrc("");
      showSuccessToast("Face ID is set up");
      onDone?.();
    },
    [onDone],
  );

  let modal = null;
  if (askPassword) {
    modal = (
      <FacePasswordModal
        onSubmit={submitPassword}
        onClose={closePassword}
        loading={loading}
        error={error}
      />
    );
  } else if (frameSrc) {
    modal = (
      <FaceFrameModal
        title="Face ID"
        src={frameSrc}
        onMessage={handleMessage}
        onClose={close}
      />
    );
  }

  return { start, loading, modal };
}
