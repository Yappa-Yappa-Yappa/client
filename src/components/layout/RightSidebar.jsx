import { Flame, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrendingPosts } from "../../api/post";
import { followUser, getSuggested, unfollowUser } from "../../api/follow";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [followingId, setFollowingId] = useState(null);

  useEffect(() => {
    let active = true;

    getTrendingPosts(3)
      .then((response) => {
        if (active) setTrending(response.data || []);
      })
      .catch(() => {
        if (active) setTrending([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    getSuggested(5)
      .then((response) => {
        if (active) setSuggestions(response.data || []);
      })
      .catch(() => {
        if (active) setSuggestions([]);
      })
      .finally(() => {
        if (active) setSuggestionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setQuery("");
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

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
      // Keep the suggestion visible when following fails.
    } finally {
      setFollowingId(null);
    }
  };

  return (
    <aside className="sticky top-4 mr-4 mt-4 hidden h-fit shrink-0 self-start space-y-4 lg:block lg:w-[280px] xl:mr-6 xl:w-[320px]">
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]"
      >
        <Search className="h-4 w-4 shrink-0 text-neutral-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Yappa"
          aria-label="Search Yappa"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
      </form>

      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center gap-2 border-b border-black/5 px-4 py-4 dark:border-white/10">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="font-bold tracking-tight text-neutral-900 dark:text-white">
            What&apos;s happening
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-2 h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div>
            {trending.map((post, index) => (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                state={{ from: "/home" }}
                className="block border-b border-black/5 px-4 py-4 transition-colors last:border-b-0 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Trending · {index + 1}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-neutral-800 dark:text-neutral-200">
                  {post.content || "A popular yap with the community"}
                </p>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {post._count?.likes || 0} likes · {post._count?.comments || 0} comments
                </p>
              </Link>
            ))}
            <Link
              to="/trend"
              className="block px-4 py-4 text-sm font-semibold text-indigo-600 hover:bg-black/5 dark:text-indigo-300 dark:hover:bg-white/5"
            >
              Show more
            </Link>
          </div>
        ) : (
          <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
            No trending yaps yet.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center gap-2 border-b border-black/5 px-4 py-4 dark:border-white/10">
          <UserPlus className="h-5 w-5 text-indigo-500" />
          <h2 className="font-bold tracking-tight text-neutral-900 dark:text-white">
            Who to follow
          </h2>
        </div>

        {suggestionsLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex animate-pulse items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="p-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Link
                  to={`/profile/${suggestion.username}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/15 font-bold text-indigo-600 dark:text-indigo-300">
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
                      @{suggestion.username}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleFollow(suggestion.id)}
                  disabled={followingId === suggestion.id}
                  className={`group shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                    suggestion.isFollowing
                      ? "bg-neutral-200 text-neutral-900 hover:bg-rose-500 hover:text-white dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-rose-500"
                      : "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  }`}
                >
                  {followingId === suggestion.id ? (
                    "..."
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
            <Link
              to="/suggestions"
              className="block rounded-xl px-2 py-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-black/5 dark:text-indigo-300 dark:hover:bg-white/5"
            >
              Show more
            </Link>
          </div>
        ) : (
          <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
            No suggestions right now.
          </p>
        )}
      </section>
    </aside>
  );
}
