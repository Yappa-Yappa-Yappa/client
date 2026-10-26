import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import FooterLinks from "./FooterLinks";

export default function MainLayout() {
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    scrollContainer?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div
      id="main-scroll-container"
      className={`${isChatPage ? "h-[100dvh]" : "h-screen"} w-screen overflow-x-hidden overflow-y-auto bg-neutral-100 text-neutral-900 transition-colors duration-300 [scrollbar-gutter:stable] dark:bg-[#050508] dark:text-neutral-100`}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] items-start">
        {/* Fixed Left Navigation */}
        <Sidebar />

        {/* Main Content Area with Contextual Sticky Header */}
        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${
            isChatPage ? "pb-0" : "pb-16"
          } md:pb-0`}
        >
          <div className="flex min-h-0 min-w-0 flex-1">
            {/* Page Content Rendered via Outlet */}
            <main className="relative mx-auto min-h-screen w-full min-w-0 max-w-4xl flex-1 p-0">
              <Outlet />
              {!isChatPage && (
                <div className="mt-6 lg:hidden">
                  <FooterLinks />
                </div>
              )}
              {!isChatPage && (
                <div
                  className="h-[calc(7rem+env(safe-area-inset-bottom))] shrink-0 md:h-6"
                  aria-hidden="true"
                />
              )}
            </main>

            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
