import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle Theme"
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-16 shrink-0 items-center rounded-full border px-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 ${
        isDark
          ? "border-indigo-400/30 bg-indigo-950"
          : "border-amber-300/60 bg-sky-200"
      }`}
    >
      <Sun
        className={`absolute left-2 h-4 w-4 text-amber-500 transition-opacity duration-300 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute right-2 h-4 w-4 text-indigo-200 transition-opacity duration-300 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
      <span
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
