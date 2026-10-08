import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";
import YapLogo from "../../assets/icons/YAP-nobg.png";

export default function AuthShell({ children, title, description }) {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-primary)]">
      <div className="relative flex min-h-screen w-full overflow-hidden bg-[var(--bg-main)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
          <div className="absolute -bottom-36 -right-32 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl sm:h-[32rem] sm:w-[32rem]" />
        </div>

        <section className="relative z-10 hidden min-h-screen w-1/2 overflow-hidden bg-[#171947] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(129,140,248,0.9),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(217,70,239,0.55),transparent_36%),linear-gradient(135deg,#111336_0%,#24145c_52%,#101126_100%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />
          <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full border border-white/10 bg-indigo-400/20 blur-2xl" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-fuchsia-300/10 bg-fuchsia-500/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 p-2 ring-1 ring-white/20 backdrop-blur-md">
              <img src={YapLogo} alt="Yappa logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight">Yappa Yappa</span>
          </div>

          <div className="relative z-10 max-w-lg pb-4 xl:pb-10">
            <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/80">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              No thoughts? Impossible.
            </div>
            <div className="relative mb-8">
              <MessageCircle className="absolute -left-2 -top-8 h-24 w-24 text-white/[0.06]" strokeWidth={1} aria-hidden="true" />
              <p className="font-belanosima text-7xl leading-none tracking-wider text-white/95 xl:text-8xl">YAP</p>
              <h1 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-md text-base leading-7 text-indigo-100/85 xl:text-lg">
                {description}
              </p>
            </div>
            <div className="flex max-w-md items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-indigo-50/90 backdrop-blur-md">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>Bring your hot takes, tiny wins, and extremely specific opinions.</span>
            </div>
          </div>
        </section>

        <section className="auth-form-panel relative z-10 flex min-h-screen w-full items-start justify-center overflow-y-auto bg-transparent px-5 py-8 sm:px-10 sm:py-10 lg:w-1/2 lg:items-center lg:bg-[var(--bg-main)] lg:px-16 lg:py-10 xl:px-24">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-subtle)] p-2 ring-1 ring-[var(--border-glass)]">
                <img
                  src={YapLogo}
                  alt="Yappa logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Yappa Yappa
              </span>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
