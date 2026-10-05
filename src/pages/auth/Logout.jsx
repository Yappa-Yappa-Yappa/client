import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2, X } from "lucide-react";

export default function Logout({
  children,
  className,
  ariaLabel = "Logout",
  username,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    if (!isAccountMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isAccountMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (err) {
      console.warn("Logout failed on server, redirecting anyway:", err);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
      navigate("/login");
    }
  };

  return (
    <div ref={accountMenuRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsAccountMenuOpen((open) => !open)}
        className={
          className ||
          "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10"
        }
        aria-label={ariaLabel}
        aria-expanded={isAccountMenuOpen}
      >
        {children || (
          <>
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="inline md:hidden lg:inline">Logout</span>
          </>
        )}
      </button>

      {isAccountMenuOpen && (
        <div className="absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-64 rounded-2xl border border-black/10 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => {
              setIsAccountMenuOpen(false);
              setIsLogoutConfirmOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-neutral-900 transition-colors hover:bg-black/5 dark:text-neutral-100 dark:hover:bg-white/10"
          >
            <span>
              Log out <span className="font-normal">@{username || "yapper"}</span>
            </span>
          </button>
        </div>
      )}

      {/* Centered Modal Overlay via React Portal */}
      {isLogoutConfirmOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-black/80"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isLoggingOut) {
                setIsLogoutConfirmOpen(false);
              }
            }}
          >
            <div className="w-full max-w-sm space-y-4 rounded-2xl border border-black/10 bg-white p-6 text-neutral-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold dark:text-neutral-100">
                  Log Out
                </h3>
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  disabled={isLoggingOut}
                  className="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                Are you sure you want to log out of your account?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  disabled={isLoggingOut}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-red-600/20"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
