import { useEffect, useState } from "react";
import { Loader2, ScanFace, X } from "lucide-react";
import { getFaceStatus } from "../api/face";
import { useFaceSetup } from "../hooks/useFaceSetup";

const DISMISS_KEY = "faceIdBannerDismissed";

// Offers Face ID setup to users who haven't registered a face. Hidden if the Face ID service is off or unreachable.
export default function FaceIdBanner() {
  const [visible, setVisible] = useState(false);
  const { start, loading, modal } = useFaceSetup({
    onDone: () => setVisible(false),
  });

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    let active = true;
    getFaceStatus()
      .then((res) => {
        if (active) setVisible(res.data?.hasFace === false);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible && !modal) return null;

  return (
    <>
      {visible && (
      <div className="flex items-center gap-3 border-b border-black/10 bg-indigo-600/5 px-4 py-3 dark:border-white/10 dark:bg-indigo-500/10 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
          <ScanFace className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Sign in faster with Face ID
          </span>
          <span className="mt-1 block text-xs text-neutral-500">
            Register your face once, then log in with a quick scan.
          </span>
        </span>
        <button
          type="button"
          onClick={start}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-600/10 px-4 py-2 text-sm font-medium text-indigo-600 transition-all duration-200 hover:bg-indigo-600/20 active:scale-[0.98] disabled:opacity-60 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Set up
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-600 dark:hover:bg-white/5 dark:hover:text-neutral-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      )}
      {modal}
    </>
  );
}
