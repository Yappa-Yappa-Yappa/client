import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationSkeleton from "../components/NotificationSkeleton";
import { useNotifications } from "../hooks/useNotifications";

const relativeTime = (value) => {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString();
};

const notificationMeta = {
  LIKE: { icon: Heart, verb: "liked your yap", color: "text-rose-500" },
  COMMENT: {
    icon: MessageCircle,
    verb: "commented on your yap",
    color: "text-indigo-500",
  },
  FOLLOW: {
    icon: UserPlus,
    verb: "started following you",
    color: "text-emerald-500",
  },
};

export default function Notification() {
  const navigate = useNavigate();
  const {
    notifications,
    pagination,
    loading,
    error,
    markRead,
    markAllRead,
    removeNotification,
    fetchNotifications,
  } = useNotifications();

  const openNotification = async (notification) => {
    await markRead(notification.id);
    if (notification.type === "FOLLOW" && notification.actor?.username) {
      navigate(`/profile/${notification.actor.username}`);
    } else if (notification.postId) {
      navigate(`/post/${notification.postId}`, {
        state: { from: "/notification" },
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Stay in the loop
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Notifications
          </h1>
        </div>
        <button
          onClick={markAllRead}
          disabled={!notifications.some((item) => !item.isRead)}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-500/10 disabled:opacity-40 dark:text-indigo-300"
        >
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
          <button
            onClick={() => fetchNotifications()}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}
      {loading && notifications.length === 0 ? (
        <NotificationSkeleton />
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
          <Bell className="mx-auto h-8 w-8 text-neutral-400" />
          <h2 className="mt-3 font-semibold">You’re all caught up</h2>
          <p className="mt-1 text-sm text-neutral-500">
            New likes, comments, and follows will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const meta =
              notificationMeta[notification.type] || notificationMeta.LIKE;
            const Icon = meta.icon;
            const actorName = notification.actor?.name || "Someone";
            return (
              <div
                key={notification.id}
                className={`group flex items-center gap-3 rounded-2xl border p-4 transition ${notification.isRead ? "border-black/10 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60" : "border-indigo-500/20 bg-indigo-500/[0.07] dark:bg-indigo-500/10"}`}
              >
                <button
                  onClick={() => openNotification(notification)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className="relative h-11 w-11 shrink-0 rounded-full bg-indigo-500/20 text-center text-sm font-bold text-indigo-600 dark:text-indigo-300">
                    <div className="h-full w-full overflow-hidden rounded-full">
                      {notification.actor?.imageUrl ? (
                        <img
                          src={notification.actor.imageUrl}
                          alt={actorName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          {actorName[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 z-10 rounded-full border-2 border-white bg-white p-0.5 dark:border-neutral-900 dark:bg-neutral-900 ${meta.color}`}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-neutral-800 dark:text-neutral-200">
                      <strong>{actorName}</strong> {meta.verb}
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      {relativeTime(notification.createdAt)}
                      {notification.post?.content
                        ? ` · “${notification.post.content.slice(0, 50)}${notification.post.content.length > 50 ? "…" : ""}”`
                        : ""}
                    </span>
                  </span>
                  {!notification.isRead && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  )}
                </button>
                <button
                  onClick={() => removeNotification(notification.id)}
                  aria-label="Delete notification"
                  className="rounded-lg p-2 text-neutral-400 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {pagination?.page < pagination?.totalPages && (
            <button
              onClick={() => fetchNotifications(pagination.page + 1, true)}
              disabled={loading}
              className="w-full rounded-xl border border-black/10 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-500/10 disabled:opacity-50 dark:border-neutral-800 dark:text-indigo-300"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
