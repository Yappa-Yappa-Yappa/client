import { Link, Outlet } from "react-router-dom";
import logo from "../../assets/icons/YAP-nobg.png";
import FooterLinks from "./FooterLinks";

export default function LegalLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Yappa" className="h-8 w-8" />
            <span className="font-semibold">Yappa</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-300"
          >
            Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-black/10 py-6 dark:border-white/10">
        <div className="mx-auto max-w-2xl">
          <FooterLinks />
        </div>
      </footer>
    </div>
  );
}
