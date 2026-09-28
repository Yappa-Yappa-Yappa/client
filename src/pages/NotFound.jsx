import { Compass, Home, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-100 px-4 py-12 text-neutral-900 dark:bg-[#050508] dark:text-neutral-100">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/15" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl dark:bg-fuchsia-500/15" />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-indigo-500/15 bg-white/75 px-6 py-10 text-center shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-indigo-400/15 dark:bg-white/[0.04] dark:shadow-black/30 sm:px-12 sm:py-14">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-violet-500">
          <Compass className="h-10 w-10" strokeWidth={1.8} aria-hidden="true" />
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 rotate-12 text-fuchsia-400 dark:text-fuchsia-300" strokeWidth={2.2} aria-hidden="true" />
        </div>

        <p className="mt-7 font-belanosima text-7xl leading-none tracking-wider text-indigo-600 dark:text-indigo-300 sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-belanosima text-3xl leading-tight tracking-wide text-neutral-900 dark:text-white sm:text-4xl">
          Yappa took a wrong turn
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:text-base">
          This page went to get snacks and never came back. Let&apos;s pretend that
          was intentional.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-[#050508]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Rescue me
        </Link>
      </section>
    </main>
  );
}
