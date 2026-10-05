export default function NotificationSkeleton() {
  return (
    <div className="animate-pulse space-y-0">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center gap-3 border border-black/10 bg-white/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="h-11 w-11 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
