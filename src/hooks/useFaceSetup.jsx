import { useCallback, useState } from "react";
import { getFaceSetupLink } from "../api/face";
import FaceFrameModal from "../components/FaceFrameModal";
import { useTheme } from "../contexts/ThemeContext";
import { showErrorToast, showSuccessToast } from "../utils/toast";

// Opens the Face ID setup scan in a popup. Render `modal` somewhere in your component; call `start` on click.
export function useFaceSetup({ onDone }) {
  const { theme } = useTheme();
  const [frameSrc, setFrameSrc] = useState("");
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const res = await getFaceSetupLink();
      const url = new URL(res.data.url);
      url.searchParams.set("embed", "1");
      url.searchParams.set("parent", window.location.origin);
      url.searchParams.set("theme", theme);
      setFrameSrc(url.toString());
    } catch {
      showErrorToast("Face ID isn't available right now");
    } finally {
      setLoading(false);
    }
  };

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

  const modal = frameSrc ? (
    <FaceFrameModal
      title="Face ID"
      src={frameSrc}
      onMessage={handleMessage}
      onClose={close}
    />
  ) : null;

  return { start, loading, modal };
}
