import { Flame, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrendingPosts } from "../../api/post";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setQuery("");
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
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
    </aside>
  );
}
