import {
  Bell,
  History,
  Home,
  MessageCircle,
  MoreHorizontal,
  Search,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { NavLink } from "react-router-dom";
import { getUnreadConversationCount } from "../../api/conversation";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";

const socketUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/api\/?$/, "");

export default function Sidebar() {
  const { user, accessToken } = useAuth();
  const { unreadCount } = useNotifications();
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) return undefined;

    const refreshChatUnreadCount = async () => {
      try {
        const response = await getUnreadConversationCount();
        setChatUnreadCount(response.data?.count || 0);
      } catch {
        // Keep the existing count if the unread-count request fails.
      }
    };

    refreshChatUnreadCount();
    const socket = socketUrl
      ? io(socketUrl, { auth: { token: accessToken } })
      : null;

    socket?.on("message:new", (message) => {
      if (message.senderId !== user?.id) {
        setChatUnreadCount((count) => count + 1);
      }
    });
    socket?.on("conversation:unread-count", ({ count } = {}) => {
      setChatUnreadCount(count || 0);
    });
    window.addEventListener("focus", refreshChatUnreadCount);

    return () => {
      window.removeEventListener("focus", refreshChatUnreadCount);
      socket?.disconnect();
    };
  }, [accessToken, user?.id]);
  const navItems = [
    {
      icon: <Home className="w-6 h-6 shrink-0" />,
      label: "Home",
      path: "/home",
    },
    {
      icon: <Search className="w-6 h-6 shrink-0" />,
      label: "Search",
      path: "/search",
    },
    {
      icon: <Bell className="w-6 h-6 shrink-0" />,
      label: "Notification",
      path: "/notification",
    },
    {
      icon: <MessageCircle className="w-6 h-6 shrink-0" />,
      label: "Yap",
      path: "/chat",
    },
    {
      icon: <Users className="w-6 h-6 shrink-0" />,
      label: "Yappers",
      path: `/friend/${user.username}/following`,
    },
    {
      icon: <Star className="w-6 h-6 shrink-0" />,
      label: "Favorite",
      path: "/favorite",
    },
    {
      icon: <History className="w-6 h-6 shrink-0" />,
      label: "History",
      path: "/history",
    },
    {
      icon: <TrendingUp className="w-6 h-6 shrink-0" />,
      label: "Trending",
      path: "/trend",
    },
    {
      icon: <User className="w-6 h-6 shrink-0" />,
      label: "Profile",
      path: `/profile/${user.username}`,
    },
  ];

  return (
    <>
      <aside
        className="relative hidden h-screen w-[220px] shrink-0 select-none flex-col px-4 py-6 transition-colors duration-300 md:flex z-20
      /* Light Mode */
      bg-white/70 border-r border-black/10 text-neutral-900
      /* Dark Mode */
      dark:bg-black/40 dark:border-r dark:border-white/10 dark:text-neutral-100
      backdrop-blur-xl"
      >
        {/* Ambient Lighting Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[70px] pointer-events-none" />

        {/* Brand Header */}
        <div className="px-3 mb-8 relative z-10">
          <h1 className="text-2xl font-lacquer tracking-wide text-indigo-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-neutral-200 dark:to-indigo-300">
            Yappa Yappa
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 px-1 relative z-10">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  isActive
                    ? /* Active State */
                      "bg-indigo-600/10 text-indigo-600 border border-indigo-500/20 font-semibold shadow-sm " +
                      "dark:bg-white/[0.08] dark:text-white dark:border-white/15 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
                    : /* Inactive Hover State */
                      "text-neutral-600 hover:text-black hover:bg-black/5 " +
                      "dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.04] border border-transparent"
                }`
              }
            >
              {/* Group icon and text together */}
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
                {item.label === "Notification" && unreadCount > 0 && (
                  <span className="ml-auto min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {item.label === "Yap" && chatUnreadCount > 0 && (
                  <span className="ml-auto min-w-5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                    {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                  </span>
                )}
              </div>

              {/* Active Indicator Dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-[.active]:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-black/10 bg-white px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-neutral-950 md:hidden">
        {[
          { icon: Home, label: "Home", path: "/home" },
          { icon: Search, label: "Search", path: "/search" },
          { icon: MessageCircle, label: "Chat", path: "/chat" },
          { icon: Bell, label: "Alerts", path: "/notification" },
          { icon: User, label: "Profile", path: `/profile/${user.username}` },
        ].map(({ icon: Icon, label, path }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `relative flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-neutral-500 dark:text-neutral-400"
              }`
            }
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {label === "Alerts" && unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {label === "Chat" && chatUnreadCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-indigo-600 px-1 text-center text-[9px] font-bold text-white">
                  {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                </span>
              )}
            </span>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}

        <div className="relative flex min-w-0 flex-col items-center">
          {moreOpen && (
            <div className="absolute bottom-14 right-1 min-w-40 overflow-hidden rounded-xl border border-black/10 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
              {[
                {
                  icon: Users,
                  label: "Yappers",
                  path: `/friend/${user.username}/following`,
                },
                { icon: History, label: "History", path: "/history" },
                { icon: TrendingUp, label: "Trending", path: "/trend" },
              ].map(({ icon: Icon, label, path }) => (
                <NavLink
                  key={label}
                  to={path}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={`flex w-full min-w-0 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors ${
              moreOpen
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
            aria-label="More navigation options"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
