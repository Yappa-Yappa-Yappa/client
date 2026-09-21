export default function UserPostSkeleton() {
  return (
    <div
      className="w-full animate-pulse space-y-3 rounded-2xl border border-black/10 bg-white/60 p-5 dark:border-neutral-800
      dark:bg-neutral-900/60"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-2 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>

      <div className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-4 w-3/5 rounded bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}
