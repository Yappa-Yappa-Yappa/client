import YapLogo from "../../assets/icons/YAP-nobg.png";

export default function AuthShell({ children }) {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-primary)]">
      <div className="relative flex min-h-screen w-full overflow-hidden bg-[var(--bg-main)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
          <div className="absolute -bottom-36 -right-32 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl sm:h-[32rem] sm:w-[32rem]" />
        </div>

        <section className="auth-form-panel relative z-10 flex min-h-screen w-full items-start justify-center overflow-y-auto bg-transparent px-5 py-8 sm:px-10 sm:py-10 lg:items-center lg:px-16 lg:py-10 xl:px-24">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
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
