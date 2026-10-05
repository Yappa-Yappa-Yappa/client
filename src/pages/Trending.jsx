import {
  ArrowUpRight,
  ChartColumn,
  Flame,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrendingPosts } from "../api/post";

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

function TrendingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="h-3 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-3 h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-2 h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}

export default function Trending() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchTrendingPosts = async () => {
      try {
        const response = await getTrendingPosts(6);
        if (active) setTrending(response.data || []);
      } catch {
        if (active) setError("We couldn't load trending yaps right now.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTrendingPosts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 via-white/70 to-fuchsia-500/10 p-6 shadow-sm dark:border-indigo-400/15 dark:from-indigo-500/15 dark:via-white/[0.04] dark:to-fuchsia-500/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shadow-rose-500/20">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
              Happening now
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              Trending on Yappa
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              Catch the yaps getting the most attention this week.
            </p>
          </div>
        </div>
      </div>

      {loading && <TrendingSkeleton />}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-sm text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && trending.length === 0 && (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-8 text-center text-sm text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400">
          No trending yaps yet. Be the first to start a conversation.
        </div>
      )}

      {!loading && !error && trending.length > 0 && (
        <div className="space-y-3">
          {trending.map((post, index) => (
            <article
              key={post.id}
              className="group rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-indigo-400/30"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-bold text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/15 font-bold text-indigo-600 dark:text-indigo-300">
                      {post.user?.imageUrl ? (
                        <img
                          src={post.user.imageUrl}
                          alt={post.user.name || "Yapper"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (post.user?.name || "Y")[0]
                      )}
                    </div>
                    <span className="truncate font-semibold text-neutral-700 dark:text-neutral-200">
                      {post.user?.name || "Yapper"}
                    </span>
                    <span>·</span>
                    <span className="shrink-0">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <Link
                    to={`/post/${post.id}`}
                    state={{ from: "/trend" }}
                    className="mt-2 block text-sm leading-6 text-neutral-800 transition group-hover:text-indigo-600 dark:text-neutral-200 dark:group-hover:text-indigo-300"
                  >
                    {post.content || "Shared a yap with the community."}
                  </Link>

                  {post.images?.[0]?.url && (
                    <img
                      src={post.images[0].url}
                      alt=""
                      className="mt-3 max-h-52 w-full rounded-xl object-cover"
                    />
                  )}

                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {post._count?.likes || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post._count?.comments || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ChartColumn className="h-3.5 w-3.5" />
                      {post.viewCount || 0}
                    </span>
                    <Link
                      to={`/post/${post.id}`}
                      state={{ from: "/trend" }}
                      className="ml-auto inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300"
                    >
                      View yap <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
