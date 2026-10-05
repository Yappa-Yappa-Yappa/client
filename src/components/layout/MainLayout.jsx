import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import ThemeToggle from "../ThemeToggle";
import Logout from "../../pages/auth/Logout";

export default function MainLayout() {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith("/profile/");
  const isFriendPage = location.pathname.startsWith("/friend/");

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
      case "/favorite":
        return "Favorites Yaps";
      case "/history":
        return "Activity History";
      case "/trend":
        return "Trending Topics";
      case "/suggestions":
        return "Who to Follow";
      default:
        return "Yappa Yappa";
    }
  };

  return (
    <div
      id="main-scroll-container"
      className={`h-screen w-screen overflow-x-hidden bg-neutral-100 text-neutral-900 transition-colors duration-300 dark:bg-[#050508] dark:text-neutral-100 ${
        location.pathname === "/chat" ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
    >
      <div
        className={`mx-auto flex min-h-screen w-full items-start ${
          location.pathname === "/chat" ? "max-w-none" : "max-w-[1280px]"
        }`}
      >
        {/* Fixed Left Navigation */}
        <Sidebar />

        {/* Main Content Area with Contextual Sticky Header */}
        <div
          className={`flex min-h-screen min-w-0 flex-1 flex-col ${
            location.pathname === "/chat" ? "pb-0" : "pb-16"
          } md:pb-0 ${
            location.pathname === "/chat"
              ? "overflow-hidden"
              : "lg:pr-[280px] xl:pr-[320px]"
          }`}
        >
          {/* Subtle Sticky Header */}
          {location.pathname !== "/chat" && (
            <header
              className={`sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-black/5 bg-white/40 py-3 backdrop-blur-xl dark:border-white/5 dark:bg-black/20 sm:py-4 ${
                location.pathname === "/home" ? "px-4" : "px-4 sm:px-6"
              }`}
            >
              <h2 className="truncate text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 sm:text-base">
                {getPageTitle(location.pathname)}
              </h2>

              <div className="flex items-center gap-3">
                {/* Quick Actions */}
                <ThemeToggle />
                <Logout />
              </div>
            </header>
          )}

          <div className="flex min-h-0 min-w-0 flex-1">
            {/* Page Content Rendered via Outlet */}
            <main
              className={`relative min-h-0 min-w-0 flex-1 ${
                location.pathname === "/chat"
                ? "max-w-none p-0"
                : location.pathname === "/notification"
                  ? "mx-auto w-full max-w-4xl p-0"
                  : isProfilePage
                    ? "mx-auto w-full max-w-4xl p-0"
                    : ["/home", "/search", "/trend"].includes(
                          location.pathname,
                        ) ||
                        isFriendPage
                      ? "mx-auto w-full max-w-4xl p-0"
                  : "mx-auto w-full max-w-4xl p-0 sm:p-6 md:pb-6"
              }`}
            >
              <Outlet />
              {location.pathname !== "/chat" && (
                <div
                  className="h-[calc(7rem+env(safe-area-inset-bottom))] shrink-0 md:h-6"
                  aria-hidden="true"
                />
              )}
            </main>

            {location.pathname !== "/chat" && <RightSidebar />}
          </div>
        </div>
      </div>
    </div>
  );
}
