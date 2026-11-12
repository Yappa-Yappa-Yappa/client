import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export default function ConfirmDeleteModal({
  title = "Delete post?",
  message = "This can't be undone and it will be removed from your profile and the feed.",
  onConfirm,
  onClose,
}) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        // The modal can render inside a clickable card, so don't let clicks reach it.
        event.stopPropagation();
        if (!deleting) onClose();
      }}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        <p className="mt-2 text-sm text-neutral-500">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg px-3 py-1.5 text-xs text-neutral-500 hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
