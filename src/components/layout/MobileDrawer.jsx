import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  History,
  Settings,
  Star,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Logout from "../../pages/auth/Logout";
import FooterLinks from "./FooterLinks";

export default function MobileDrawer({ open, onClose }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!user) return null;

  const links = [
    { icon: User, label: "Profile", path: `/profile/${user.username}` },
    {
      icon: Users,
      label: "Yappers",
      path: `/friend/${user.username}/following`,
    },
    { icon: Star, label: "Favorite", path: "/favorite" },
    { icon: History, label: "History", path: "/history" },
    { icon: TrendingUp, label: "Trending", path: "/trend" },
    { icon: Settings, label: "Settings", path: "/setting" },
  ];

  // Rendered in a portal because the sticky feed header uses backdrop-blur,
  // which would otherwise trap this fixed element inside the header.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Account menu"
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-0 z-[60] flex flex-col bg-neutral-100 text-neutral-900 transition-[transform,visibility] duration-300 ease-out dark:bg-[#050508] dark:text-neutral-100 md:hidden ${
        open ? "visible translate-x-0" : "invisible -translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <span className="text-lg font-bold">Account info</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Link
        to={`/profile/${user.username}`}
        onClick={onClose}
        className="flex items-center gap-4 px-4 py-4"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500 text-xl font-bold text-white">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name || "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            (user.name || user.username || "Y")[0].toUpperCase()
          )}
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-lg font-bold">
            {user.name || "Yapper"}
          </strong>
          <span className="block truncate text-sm text-neutral-500 dark:text-neutral-400">
            @{user.username}
          </span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto border-t border-black/10 px-2 py-2 dark:border-white/10">
        {links.map(({ icon: Icon, label, path }) => (
          <Link
            key={label}
            to={path}
            onClick={onClose}
            className="flex items-center gap-5 rounded-xl px-3 py-4 text-xl font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Icon className="h-6 w-6 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-3 border-t border-black/10 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 dark:border-white/10">
        <Logout
          ariaLabel="Open account menu"
          username={user.username}
          className="flex w-full items-center rounded-xl px-3 py-3 text-left text-base font-semibold text-red-500 transition-colors hover:bg-red-500/10"
        >
          Log out @{user.username}
        </Logout>
        <div className="-mx-4" onClick={onClose}>
          <FooterLinks />
        </div>
      </div>
    </div>,
    document.body,
  );
}
