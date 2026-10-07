function ConversationSkeleton() {
  return (
    <div className="animate-pulse space-y-1 p-2">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-xl p-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="h-3 w-8 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex min-h-full animate-pulse flex-col justify-end gap-3">
      <div className="flex justify-start">
        <div className="h-12 w-44 rounded-2xl rounded-bl-md bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="flex justify-end">
        <div className="h-16 w-56 rounded-2xl rounded-br-md bg-indigo-200 dark:bg-indigo-950" />
      </div>
      <div className="flex justify-start">
        <div className="h-10 w-64 rounded-2xl rounded-bl-md bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="flex justify-end">
        <div className="h-12 w-40 rounded-2xl rounded-br-md bg-indigo-200 dark:bg-indigo-950" />
      </div>
    </div>
  );
}

export default function ChatSkeleton({ variant }) {
  return variant === "messages" ? <MessageSkeleton /> : <ConversationSkeleton />;
}
