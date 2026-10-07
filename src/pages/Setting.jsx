import {
  Bell,
  ChevronRight,
  Palette,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "../components/ThemeToggle";

const settingSections = [
  {
    title: "Account",
    items: [
      {
        icon: UserRound,
        label: "Account information",
        description: "Manage your name, username, and profile details.",
      },
    ],
  },
  {
      title: "Preferences",
      items: [
        {
          icon: Palette,
          label: "Appearance",
          description: "Customize how Yappa looks on your devices.",
          control: "theme",
        },
      {
        icon: Bell,
        label: "Notifications",
        description: "Choose what activity you want to be notified about.",
      },
    ],
  },
  {
    title: "Privacy and safety",
    items: [
      {
        icon: ShieldCheck,
        label: "Privacy and safety",
        description: "Control your visibility and interaction settings.",
      },
    ],
  },
];

export default function Setting() {
  const { user } = useAuth();

  return (
    <section className="w-full">
      <header className="border-b border-black/10 px-4 py-5 dark:border-white/10 sm:px-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your Yappa experience.
        </p>
      </header>

      <div className="border-b border-black/10 px-4 py-5 dark:border-white/10 sm:px-6">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {user?.name || "Yapper"}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          @{user?.username || "yapper"}
        </p>
      </div>

      {settingSections.map((section) => (
        <section key={section.title}>
          <h2 className="border-b border-black/10 px-4 py-3 text-xs font-bold uppercase tracking-wide text-neutral-500 dark:border-white/10 sm:px-6">
            {section.title}
          </h2>
          <div>
            {section.items.map(
              ({ icon: Icon, label, description, control }) =>
                control === "theme" ? (
                  <div
                    key={label}
                    className="flex w-full items-center gap-3 border-b border-black/10 px-4 py-4 dark:border-white/10 sm:px-6"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {label}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        {description}
                      </span>
                    </span>
                    <ThemeToggle />
                  </div>
                ) : (
                  <button
                    key={label}
                    type="button"
                    className="flex w-full items-center gap-3 border-b border-black/10 px-4 py-4 text-left transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5 sm:px-6"
                    aria-label={`${label}, coming soon`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {label}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        {description}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-neutral-400">
                      <span className="hidden sm:inline">Coming soon</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                ),
            )}
          </div>
        </section>
      ))}
    </section>
  );
}
