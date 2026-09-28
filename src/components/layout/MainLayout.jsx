import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "../ThemeToggle";
import Logout from "../../pages/auth/Logout";

export default function MainLayout() {
  const location = useLocation();

  // Helper to display current section title based on route
  const getPageTitle = (path) => {
    switch (path) {
      case "/home":
        return "Home Feed";
      case "/search":
        return "Explore & Search";
      case "/notification":
        return "Notification Box";
      case "/chat":
        return "Yaps & Messages";
      case "/friend":
        return "Community Yappers";
      case "/history":
        return "Activity History";
      case "/trend":
        return "Trending Topics";
      default:
        return "Yappa Yappa";
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-[#050508] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Fixed Left Navigation */}
      <Sidebar />

      {/* Main Content Area with Contextual Sticky Header */}
      <div
        id="main-scroll-container"
        className={`flex h-full min-w-0 flex-1 flex-col pb-16 md:pb-0 ${
          location.pathname === "/chat" ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        {/* Subtle Sticky Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-black/5 bg-white/40 px-4 py-3 backdrop-blur-xl dark:border-white/5 dark:bg-black/20 sm:px-6 sm:py-4">
          <h2 className="truncate text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 sm:text-base">
            {getPageTitle(location.pathname)}
          </h2>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <ThemeToggle />
            <Logout />
          </div>
        </header>

        {/* Page Content Rendered via Outlet */}
        <main
          className={`flex-1 min-h-0 w-full ${
            location.pathname === "/chat"
              ? "max-w-none p-0"
              : "mx-auto max-w-4xl p-4 sm:p-6 md:pb-6"
          }`}
        >
          <Outlet />
          {location.pathname !== "/chat" && (
            <div
              className="h-[calc(6rem+env(safe-area-inset-bottom))] shrink-0 md:h-6"
              aria-hidden="true"
            />
          )}
        </main>
      </div>
    </div>
  );
}
