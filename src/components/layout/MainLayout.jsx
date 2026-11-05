import { useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import FooterLinks from "./FooterLinks";

// Last scroll position of the main container, per pathname.
const scrollPositions = new Map();

export default function MainLayout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isChatPage = location.pathname === "/chat";

  useLayoutEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (!scrollContainer) return undefined;

    const { pathname } = location;
    // Restore on browser back/forward, or when a link asks for it
    // (location.state.restoreScroll); otherwise start at the top.
    const shouldRestore =
      navigationType === "POP" || location.state?.restoreScroll;
    const target = shouldRestore ? (scrollPositions.get(pathname) ?? 0) : 0;
    scrollContainer.scrollTo({ top: target, left: 0, behavior: "auto" });

    // The page may not be tall enough yet (e.g. the profile is still loading
    // behind a skeleton), so keep retrying while the content grows, until the
    // position is reached, the user scrolls, or a few seconds pass.
    let restoring = Math.abs(scrollContainer.scrollTop - target) > 1;
    const stopRestoring = () => {
      restoring = false;
    };
    const resizeObserver = new ResizeObserver(() => {
      if (!restoring) return;
      scrollContainer.scrollTo({ top: target, left: 0, behavior: "auto" });
      if (Math.abs(scrollContainer.scrollTop - target) <= 1) restoring = false;
    });
    if (restoring && scrollContainer.firstElementChild) {
      resizeObserver.observe(scrollContainer.firstElementChild);
    }
    const restoreTimer = window.setTimeout(stopRestoring, 3000);
    const interactions = ["wheel", "touchstart", "keydown", "mousedown"];
    interactions.forEach((name) =>
      scrollContainer.addEventListener(name, stopRestoring, { passive: true }),
    );

    // Track position while on this page (a cleanup would run after the
    // new route's DOM is already in place, too late to read scrollTop).
    const handleScroll = () => {
      if (!restoring) scrollPositions.set(pathname, scrollContainer.scrollTop);
    };
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      interactions.forEach((name) =>
        scrollContainer.removeEventListener(name, stopRestoring),
      );
      window.clearTimeout(restoreTimer);
      resizeObserver.disconnect();
    };
  }, [location, navigationType]);

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
            <main className="relative mx-auto w-full min-w-0 max-w-4xl flex-1 p-0">
              <Outlet />
              {!isChatPage && (
                <div className="mt-6 lg:hidden">
                  <FooterLinks />
                </div>
              )}
              {!isChatPage && (
                <div
                  className="h-[calc(5.5rem+env(safe-area-inset-bottom))] shrink-0 md:h-0"
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
