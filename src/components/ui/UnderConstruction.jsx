import { Construction, Sparkles } from "lucide-react";

export default function UnderConstruction() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-2 py-10 sm:px-6 sm:py-16">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-indigo-500/15 bg-white/75 px-6 py-10 text-center shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-indigo-400/15 dark:bg-white/[0.04] dark:shadow-black/30 sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/20" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-fuchsia-400/15 blur-3xl dark:bg-fuchsia-500/15" />

        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-violet-500">
          <Construction className="h-10 w-10" strokeWidth={1.8} aria-hidden="true" />
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 rotate-12 text-fuchsia-400 dark:text-fuchsia-300" strokeWidth={2.2} aria-hidden="true" />
        </div>

        <div className="relative mt-7">
          <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
            Budget approved-ish
          </span>
          <h1 className="mt-4 font-belanosima text-3xl leading-tight tracking-wide text-neutral-900 dark:text-white sm:text-4xl">
            The pixels are still arguing
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:text-base">
            Our tiny team is still negotiating with the last div. Check back
            soon before the CSS starts another meeting.
          </p>
        </div>
      </div>
    </section>
  );
}
