export default function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full animate-pulse">
      <div className="overflow-hidden border border-black/10 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="h-36 bg-neutral-200 dark:bg-neutral-800 sm:h-44" />

        <div className="px-6 pb-6">
          <div className="-mt-14 h-28 w-28 rounded-full bg-neutral-300 ring-4 ring-white/70 dark:bg-neutral-700 dark:ring-neutral-800" />
        </div>

        <div className="flex items-center justify-between px-6">
          <div className="h-6 w-36 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-8 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="mx-6 mt-2 h-4 w-24 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="mx-6 mt-4 h-3 w-32 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="mx-6 mt-3 flex gap-4">
          <div className="h-4 w-20 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-20 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="m-6 h-16 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <div className="-mt-px space-y-0">
        {[1, 2].map((post) => (
          <div
            key={post}
            className="space-y-3 border border-black/10 bg-white/60 p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-3.5 w-28 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-20 rounded-md bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
            <div className="h-3.5 w-full rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3.5 w-4/5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
