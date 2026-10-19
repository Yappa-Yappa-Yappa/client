import { useEffect, useState } from "react";
import YapLogo from "../assets/icons/yappa-blob.png";

const messages = [
  "Waking up the server... it's a heavy sleeper.",
  "Poking the database with a stick.",
  "Free-tier servers take naps. Please be patient.",
  "Still here? The backend is making coffee.",
  "Almost there. We promise. (We're lying a little.)",
];

// Hide the text for the first moments so fast loads don't flash it.
const MESSAGE_DELAY_SECONDS = 2;
const SECONDS_PER_MESSAGE = 4;

export default function BootScreen() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsed((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const showMessage = elapsed >= MESSAGE_DELAY_SECONDS;
  const messageIndex = Math.min(
    Math.floor((elapsed - MESSAGE_DELAY_SECONDS) / SECONDS_PER_MESSAGE),
    messages.length - 1,
  );

  return (
    <div
      role="status"
      className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-[var(--bg-main)] px-6 text-center text-[var(--text-primary)]"
    >
      <div className="relative">
        <img
          src={YapLogo}
          alt="Yappa"
          className="h-20 w-20 animate-pulse object-contain"
        />
        <span
          aria-hidden="true"
          className="absolute -right-6 -top-3 animate-bounce text-lg font-bold text-indigo-500"
        >
          Zzz
        </span>
      </div>

      <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-indigo-500 dark:border-neutral-700" />

      <p
        aria-live="polite"
        className={`min-h-12 max-w-xs text-sm text-neutral-500 transition-opacity duration-500 dark:text-neutral-400 ${
          showMessage ? "opacity-100" : "opacity-0"
        }`}
      >
        {showMessage ? messages[messageIndex] : ""}
      </p>
    </div>
  );
}
