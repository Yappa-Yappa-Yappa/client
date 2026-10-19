import { useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { createReport } from "../api/report";

const REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "HATE_SPEECH", label: "Hate speech" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "OTHER", label: "Other" },
];

const MAX_DESCRIPTION = 500;

export default function ReportModal({ postId, onClose, onSubmitted }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createReport({
        postId,
        reason,
        description: description.trim(),
      });
      onSubmitted?.();
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Could not submit your report.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Report post"
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Report post
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <fieldset className="space-y-1">
          <legend className="mb-1 text-xs text-neutral-500">
            Why are you reporting this?
          </legend>
          {REASONS.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-800 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
            >
              <input
                type="radio"
                name="reason"
                value={item.value}
                checked={reason === item.value}
                onChange={() => setReason(item.value)}
                className="accent-indigo-600"
              />
              {item.label}
            </label>
          ))}
        </fieldset>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={MAX_DESCRIPTION}
          rows={3}
          placeholder="Add details (optional)"
          className="mt-3 w-full resize-none rounded-xl border border-neutral-300 bg-transparent p-3 text-sm text-neutral-800 outline-none focus:border-indigo-500 dark:border-neutral-700 dark:text-neutral-200"
        />
        <p className="mt-1 text-right text-[11px] text-neutral-500">
          {description.length}/{MAX_DESCRIPTION}
        </p>

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !reason}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {submitting && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
            Submit report
          </button>
        </div>
      </form>
    </div>
  );
}
