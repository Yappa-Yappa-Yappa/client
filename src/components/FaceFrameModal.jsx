import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Shows a Face ID page in a popup on top of Yappa, so the address bar never leaves Yappa.
// The page reports back with window.postMessage; only messages from that page's own origin are passed on.
export default function FaceFrameModal({ src, title, onMessage, onClose }) {
  const frameRef = useRef(null);

  useEffect(() => {
    const faceOrigin = new URL(src).origin;

    const handleMessage = (event) => {
      if (event.origin !== faceOrigin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      onMessage(event.data);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [src, onMessage, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-main)] p-5 shadow-2xl shadow-indigo-600/10"
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-[var(--text-secondary)] transition hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          allow="camera"
          className="h-[600px] max-h-[75vh] w-full rounded-xl border-0"
        />
      </div>
    </div>
  );
}
