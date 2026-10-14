import { useEffect, useState } from "react";

const messages = [
  "Hang tight, the server is waking up from a nap.",
  "Knocking on the database's door...",
  "Free servers are sleepy. This can take up to a minute.",
  "Still going. Go stretch, we'll be here.",
];

// Mount this only while a request is running; its timer starts on mount.
const SHOW_AFTER_SECONDS = 3;
const SECONDS_PER_MESSAGE = 5;

export default function SlowRequestNotice() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsed((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  if (elapsed < SHOW_AFTER_SECONDS) return null;

  const messageIndex = Math.min(
    Math.floor((elapsed - SHOW_AFTER_SECONDS) / SECONDS_PER_MESSAGE),
    messages.length - 1,
  );

  return (
    <p
      role="status"
      aria-live="polite"
      className="mt-3 text-center text-xs text-[var(--text-muted)]"
    >
      {messages[messageIndex]}
    </p>
  );
}
