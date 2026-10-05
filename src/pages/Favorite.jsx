import { Bookmark, Clock3, Image as ImageIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFavorites, removeFavorite } from "../api/favorite";
import { showSuccessToast } from "../utils/toast";

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "Recently";

  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return "Recently";

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

export default function Favorite() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFavorites();
      setFavorites(response.data || []);
    } catch (err) {
      console.error("Failed to load favorites:", err);
      setError("We couldn't load your favorite yaps. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchFavorites, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchFavorites]);

  const handleRemove = async (favorite) => {
    const postId = favorite.post?.id;
    if (!postId || removingId) return;

    try {
      setRemovingId(postId);
      await removeFavorite(postId);
      setFavorites((currentFavorites) =>
        currentFavorites.filter((item) => item.post?.id !== postId),
      );
      showSuccessToast("Removed from favorites.");
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      setError("We couldn't remove that favorite. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 sm:px-0">
        <div className="h-8 w-48 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-36 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-36 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-0">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
          <Bookmark className="h-5 w-5 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Favorite yaps
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {favorites.length} saved {favorites.length === 1 ? "yap" : "yaps"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 px-6 py-12 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          <Bookmark className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">
            No favorites yet
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Save yaps you want to find again later.
          </p>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Explore yaps
          </button>
        </div>
      ) : (
        <div className="space-y-0">
          {favorites.map((favorite) => {
            const post = favorite.post;
            if (!post) return null;

            const postId = post.id;
            const authorName = post.user?.name || "Yapper";
            const username = post.user?.username;
            const image = post.images?.[0]?.url;

            return (
              <article
                key={favorite.id || postId}
                className="overflow-hidden border border-black/10 bg-white/60 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900/60"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/post/${postId}`)}
                  className="block w-full text-left"
                >
                  {image && (
                    <div className="relative h-44 overflow-hidden bg-neutral-100 dark:bg-neutral-950">
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {post.images.length}
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-xs font-bold text-white">
                        {post.user?.imageUrl ? (
                          <img
                            src={post.user.imageUrl}
                            alt={authorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          authorName[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {authorName}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {username ? `@${username}` : "Yapper"}
                        </p>
                      </div>
                    </div>
                    {post.content && (
                      <p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                        {post.content}
                      </p>
                    )}
                  </div>
                </button>

                <div className="flex items-center justify-between border-t border-black/5 px-4 py-3 text-xs text-neutral-500 dark:border-neutral-800/60 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    Saved {formatRelativeTime(favorite.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(favorite)}
                    disabled={removingId === postId}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {removingId === postId ? "Removing..." : "Remove"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
