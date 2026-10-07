import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";

export default function MainLayout() {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith("/profile/");
  const isFriendPage = location.pathname.startsWith("/friend/");

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
          <div className="flex min-h-0 min-w-0 flex-1">
            {/* Page Content Rendered via Outlet */}
            <main
              className={`relative min-h-0 min-w-0 flex-1 border-x border-black/10 dark:border-neutral-800 ${
                location.pathname === "/chat"
                  ? "max-w-none p-0"
                  : location.pathname === "/notification"
                    ? "mx-auto w-full max-w-4xl p-0"
                    : isProfilePage
                      ? "mx-auto w-full max-w-4xl p-0"
                      : ["/home", "/following", "/trend"].includes(location.pathname) ||
                          isFriendPage
                        ? "mx-auto w-full max-w-4xl p-0"
                        : location.pathname === "/search"
                          ? "mx-auto w-full max-w-none p-0"
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
