import { useCallback, useEffect, useState } from "react";
import { Loader2, ScanFace } from "lucide-react";
import { getFaceStatus } from "../api/face";
import { useFaceSetup } from "../hooks/useFaceSetup";

// Settings row: shows whether Face ID is on, and lets the user set it up or replace it.
// Hidden when the Face ID service is off or unreachable.
export default function FaceIdSetting() {
  const [hasFace, setHasFace] = useState(null);

  const refresh = useCallback(() => {
    getFaceStatus()
      .then((res) => setHasFace(res.data?.hasFace ?? null))
      .catch(() => setHasFace(null));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { start, loading, modal } = useFaceSetup({ onDone: refresh });

  if (hasFace === null) return null;

  return (
    <div className="flex w-full items-center gap-3 border-b border-black/10 px-4 py-4 dark:border-white/10 sm:px-6">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
        <ScanFace className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Face ID
        </span>
        <span className="mt-1 block text-xs text-neutral-500">
          {hasFace
            ? "On. You can log in with a face scan. Replace it if your look changes."
            : "Not set up. Register your face to log in with a quick scan."}
        </span>
      </span>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="flex shrink-0 items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-600/10 px-4 py-2 text-sm font-medium text-indigo-600 transition-all duration-200 hover:bg-indigo-600/20 active:scale-[0.98] disabled:opacity-60 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {hasFace ? "Replace" : "Set up"}
      </button>
      {modal}
    </div>
  );
}
