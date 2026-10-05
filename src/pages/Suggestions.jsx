import { ArrowLeft, LoaderCircle, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { followUser, getSuggested, unfollowUser } from "../api/follow";

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followingId, setFollowingId] = useState(null);

  useEffect(() => {
    let active = true;

    getSuggested(20)
      .then((response) => {
        if (active) setSuggestions(response.data || []);
      })
      .catch(() => {
        if (active) setError("Could not load suggestions right now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleFollow = async (userId) => {
    if (followingId) return;

    const suggestion = suggestions.find((item) => item.id === userId);
    if (!suggestion) return;

    const isFollowing = Boolean(suggestion.isFollowing);
    setFollowingId(userId);
    try {
      if (isFollowing) await unfollowUser(userId);
      else await followUser(userId);

      setSuggestions((current) =>
        current.map((item) =>
          item.id === userId ? { ...item, isFollowing: !isFollowing } : item,
        ),
      );
    } catch {
      setError("Could not follow that user. Please try again.");
    } finally {
      setFollowingId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex items-center gap-3 border-b border-black/10 px-5 py-4 dark:border-neutral-800">
          <Link
            to="/home"
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-black/5 hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-neutral-200"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-bold text-neutral-900 dark:text-neutral-100">
              Who to follow
            </h1>
            <p className="text-xs text-neutral-500">
              Find more people to yap with.
            </p>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-16 text-indigo-500">
              <LoaderCircle className="h-7 w-7 animate-spin" />
            </div>
          ) : error && suggestions.length === 0 ? (
            <p className="py-16 text-center text-sm text-rose-500">{error}</p>
          ) : suggestions.length === 0 ? (
            <div className="py-16 text-center">
              <UserRound className="mx-auto h-9 w-9 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">
                You&apos;re all caught up. No new suggestions right now.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {error && <p className="mb-4 text-xs text-rose-500">{error}</p>}
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Link
                    to={`/profile/${suggestion.username}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/20 font-bold text-indigo-600 dark:text-indigo-300">
                      {suggestion.imageUrl ? (
                        <img
                          src={suggestion.imageUrl}
                          alt={suggestion.name || "Yapper"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (suggestion.name || "Y")[0]
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {suggestion.name || "Yapper"}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        @{suggestion.username} · {suggestion._count?.followers || 0} followers
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleFollow(suggestion.id)}
                    disabled={followingId === suggestion.id}
                    className={`group shrink-0 rounded-full px-4 py-2 text-xs font-bold shadow-sm transition disabled:cursor-wait disabled:opacity-60 ${
                      suggestion.isFollowing
                        ? "bg-neutral-200 text-neutral-900 hover:bg-rose-500 hover:text-white dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-rose-500"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {followingId === suggestion.id ? (
                      "Updating..."
                    ) : suggestion.isFollowing ? (
                      <>
                        <span className="group-hover:hidden">Following</span>
                        <span className="hidden group-hover:inline">Unfollow</span>
                      </>
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
