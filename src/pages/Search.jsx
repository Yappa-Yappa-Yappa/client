import {
  FileText,
  LoaderCircle,
  Search as SearchIcon,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchUserOrPost } from "../api/search";

const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

const renderLinkifiedText = (text) =>
  text.split(urlPattern).map((part, index) => {
    if (!/^(https?:\/\/|www\.)/.test(part)) return part;

    const href = part.startsWith("www.") ? `https://${part}` : part;
    return (
      <a
        key={`${part}-${index}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="break-all text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
        onClick={(event) => event.stopPropagation()}
      >
        {part}
      </a>
    );
  });

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const runSearch = useCallback(async (value) => {
    const trimmedQuery = value.trim();
    if (!trimmedQuery) {
      setSearchedQuery("");
      setResults({ users: [], posts: [] });
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await searchUserOrPost(trimmedQuery);
      setResults(response.data || { users: [], posts: [] });
      setSearchedQuery(trimmedQuery);
    } catch (requestError) {
      setResults({ users: [], posts: [] });
      setError(
        requestError.response?.data?.message || "Could not complete your search.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const searchId = window.setTimeout(() => runSearch(query), 350);
    return () => window.clearTimeout(searchId);
  }, [query, runSearch]);

  const clearSearch = () => {
    setQuery("");
    setSearchedQuery("");
    setResults({ users: [], posts: [] });
    setError("");
  };

  const tabs = [
    ["all", "All"],
    ["users", "People"],
    ["posts", "Posts"],
  ];
  const visibleUsers = activeTab === "posts" ? [] : results.users;
  const visiblePosts = activeTab === "users" ? [] : results.posts;
  const hasResults = visibleUsers.length > 0 || visiblePosts.length > 0;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="border-b border-black/10 p-5 dark:border-neutral-800">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Explore & Search
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Find people and posts across Yappa.
          </p>

          <div className="mt-4 flex min-w-0 items-center gap-2 rounded-xl border border-black/10 bg-transparent px-3 dark:border-neutral-700">
              <SearchIcon className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people or posts..."
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-neutral-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                  </button>
                )}
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-black/10 dark:border-neutral-800">
          {tabs.map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {label}
              {activeTab === tab && (
                <span className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-16 text-indigo-500">
              <LoaderCircle className="h-7 w-7 animate-spin" />
            </div>
          ) : error ? (
            <p className="py-16 text-center text-sm text-rose-500">{error}</p>
          ) : !searchedQuery ? (
            <div className="py-16 text-center">
              <SearchIcon className="mx-auto h-9 w-9 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">
                Search for a person or post to get started.
              </p>
            </div>
          ) : !hasResults ? (
            <div className="py-16 text-center">
              <UserRound className="mx-auto h-9 w-9 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">
                No results found for “{searchedQuery}”.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleUsers.length > 0 && (
                <div>
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
                    People
                  </h2>
                  <div className="space-y-1">
                    {visibleUsers.map((user) => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.username}`}
                        className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-indigo-500/20 text-center font-bold text-indigo-600 dark:text-indigo-300">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.name || "Yapper"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center">
                              {(user.name || user.username || "Y")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {user.name || "Yapper"}
                          </p>
                          <p className="truncate text-xs text-neutral-500">
                            @{user.username || "yapper"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {visiblePosts.length > 0 && (
                <div>
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Posts
                  </h2>
                  <div className="space-y-2">
                    {visiblePosts.map((post) => {
                      const image = post.images?.[0]?.url || post.images?.[0];

                      return (
                        <div
                          key={post.id}
                          role="link"
                          tabIndex={0}
                          onClick={() => navigate(`/post/${post.id}`)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              navigate(`/post/${post.id}`);
                            }
                          }}
                          className="flex gap-3 rounded-xl border border-black/5 p-3 transition-colors hover:bg-black/5 dark:border-neutral-800 dark:hover:bg-white/5"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt=""
                              className="h-16 w-16 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <p className="min-w-0 self-center whitespace-pre-wrap break-words text-sm text-neutral-700 dark:text-neutral-300">
                            {post.content
                              ? renderLinkifiedText(post.content)
                              : "Post with image"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
