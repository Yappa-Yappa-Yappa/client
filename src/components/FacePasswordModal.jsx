import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

// Asks for the account password before the Face ID scan opens, so an open session alone
// cannot register or replace a face.
export default function FacePasswordModal({ onSubmit, onClose, loading, error }) {
  const [password, setPassword] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!password || loading) return;
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Confirm your password"
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-main)] p-5 shadow-2xl shadow-indigo-600/10"
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Confirm your password
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
        <p className="mb-4 text-sm text-neutral-500">
          Enter your password to set up or replace Face ID.
        </p>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          maxLength={255}
          aria-label="Password"
          className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 dark:border-white/10"
        />
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 transition hover:bg-black/5 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!password || loading}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-600/10 px-4 py-2 text-sm font-medium text-indigo-600 transition-all duration-200 hover:bg-indigo-600/20 active:scale-[0.98] disabled:opacity-60 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
