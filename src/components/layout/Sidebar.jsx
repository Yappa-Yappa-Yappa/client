import {
  Bell,
  History,
  Home,
  MessageCircle,
  MoreHorizontal,
  Search,
  Settings,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { io } from "socket.io-client";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getUnreadConversationCount } from "../../api/conversation";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import Logout from "../../pages/auth/Logout";
import ThemeToggle from "../ThemeToggle";

const socketUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/api\/?$/, "");
const mobileGlassClass =
  "border border-white/60 bg-white/55 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/20 dark:bg-neutral-900/55";

export default function Sidebar() {
  const location = useLocation();
  const { user, accessToken } = useAuth();
  const { unreadCount } = useNotifications();
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const isMobileChatRoom =
    location.pathname === "/chat" && location.state?.chatRoom === true;
  const moreRouteActive =
    location.pathname.startsWith("/friend/") ||
    ["/favorite", "/history", "/trend"].includes(location.pathname);

  useEffect(() => {
    if (!moreOpen) return undefined;

    const handleOutsideTap = (event) => {
      if (!moreRef.current?.contains(event.target)) {
        setMoreOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideTap);
    return () => document.removeEventListener("pointerdown", handleOutsideTap);
  }, [moreOpen]);

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
    {
      icon: <Settings className="w-6 h-6 shrink-0" />,
      label: "Setting",
      path: "/setting",
    },
    {
      icon: <ThemeToggle />,
    },
  ];

  return (
    <>
      <aside
        className="sticky top-0 z-20 hidden h-screen w-[76px] shrink-0 self-start select-none flex-col px-2 py-6 transition-all duration-300 md:flex lg:w-[220px] lg:px-4
      /* Light Mode */
      bg-neutral-100 text-neutral-900
      /* Dark Mode */
      dark:bg-[#050508] dark:text-neutral-100
      backdrop-blur-xl"
      >
        {/* Ambient Lighting Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[70px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 mb-8 px-0 text-center lg:px-3 lg:text-left">
          <Link
            to="/home"
            className="text-2xl font-lacquer tracking-wide text-indigo-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-neutral-200 dark:to-indigo-300"
          >
            <span className="hidden lg:inline">Yappa Yappa</span>
            <span className="lg:hidden">Y</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="relative z-10 flex flex-col gap-1.5 px-0 lg:px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-center rounded-xl px-2 py-2.5 text-sm font-medium transition-all duration-200 lg:justify-between lg:px-4 ${
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
              <div className="flex items-center gap-0 lg:gap-3">
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
                {item.label === "Notification" && unreadCount > 0 && (
                  <span className="ml-auto hidden h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-center text-[10px] font-bold leading-none text-white lg:flex">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {item.label === "Yap" && chatUnreadCount > 0 && (
                  <span className="ml-auto hidden h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-center text-[10px] font-bold leading-none text-white lg:flex">
                    {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                  </span>
                )}
              </div>

              {/* Active Indicator Dot */}
              <span className="hidden h-1.5 w-1.5 rounded-full bg-indigo-500 opacity-0 transition-opacity group-[.active]:opacity-100 lg:block" />
            </NavLink>
          ))}
        </nav>

        <div className="relative z-10 mt-auto border-t border-black/10 pt-4 dark:border-white/10">
          <Logout
            ariaLabel="Open account menu"
            username={user.username}
            className="group flex w-full items-center justify-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 lg:justify-start lg:px-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/20 font-bold text-indigo-600 dark:text-indigo-300">
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
            <span className="hidden min-w-0 flex-1 lg:block">
              <strong className="block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {user.name || "Yapper"}
              </strong>
              <span className="block truncate text-xs text-neutral-500">
                @{user.username || "yapper"}
              </span>
            </span>
            <MoreHorizontal className="hidden h-5 w-5 shrink-0 text-neutral-500 lg:block" />
          </Logout>
        </div>
      </aside>

      {!isMobileChatRoom && (
        <div
          ref={moreRef}
          className="pointer-events-none fixed inset-x-3 bottom-3 z-50 md:hidden"
        >
          <nav
            className={`relative pointer-events-auto grid min-h-16 grid-cols-6 overflow-visible rounded-full px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_10px_30px_rgba(0,0,0,0.14)] ${mobileGlassClass}`}
          >
            {[
              { icon: Home, label: "Home", path: "/home" },
              { icon: Search, label: "Search", path: "/search" },
              { icon: MessageCircle, label: "Chat", path: "/chat" },
              { icon: Bell, label: "Alerts", path: "/notification" },
              {
                icon: User,
                label: "Profile",
                path: `/profile/${user.username}`,
              },
            ].map(({ icon: Icon, label, path }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `group relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors ${
                    isActive
                      ? "active text-indigo-600 dark:text-indigo-400"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`
                }
              >
                <span className="relative">
                  <Icon className="h-5 w-5 transition-transform duration-200 group-[.active]:scale-125" />
                  {label === "Alerts" && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-none text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  {label === "Chat" && chatUnreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-center text-[9px] font-bold leading-none text-white">
                      {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                    </span>
                  )}
                </span>
                <span className="hidden duration-200 truncate group-[.active]:block">
                  {label}
                </span>
              </NavLink>
            ))}

            <div className="relative flex min-w-0 flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                className={`group flex w-full min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors ${
                  moreOpen || moreRouteActive
                    ? "active text-indigo-600 dark:text-indigo-400"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
                aria-label="More navigation options"
              >
                <MoreHorizontal
                  className={`h-5 w-5 transition-transform duration-200 ${
                    moreOpen || moreRouteActive ? "scale-125" : ""
                  }`}
                />
                <span className={moreOpen || moreRouteActive ? "" : "sr-only"}>
                  More
                </span>
              </button>
            </div>
          </nav>

          <div
            aria-hidden={!moreOpen}
            className={`absolute bottom-[4.5rem] right-1 min-w-40 origin-bottom-right overflow-hidden rounded-2xl p-1 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition-[opacity,transform] duration-200 ease-out ${mobileGlassClass} ${
              moreOpen
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0"
            }`}
          >
            {[
              {
                icon: Users,
                label: "Yappers",
                path: `/friend/${user.username}/following`,
              },
              { icon: Star, label: "Favorite", path: "/favorite" },
              { icon: History, label: "History", path: "/history" },
              { icon: TrendingUp, label: "Trending", path: "/trend" },
              { icon: Settings, label: "Settings", path: "/setting" },
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
        </div>
      )}
    </>
  );
}
