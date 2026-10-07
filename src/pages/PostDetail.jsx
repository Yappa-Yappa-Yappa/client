import {
  ArrowLeft,
  Bookmark,
  ChartColumn,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { addFavorite, removeFavorite } from "../api/favorite";
import { getLikesByPost, likePost, unlikePost } from "../api/like";
import { repostPost, removeRepost, getRepostStatus } from "../api/repost";
import { getFavorites } from "../api/favorite";
import { getFeedById, incrementView } from "../api/post";
import CommentSection from "../components/CommentSection";
import LinkifiedText from "../components/LinkifiedText";
import { useAuth } from "../hooks/useAuth";

export default function PostDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const backPath = location.state?.from || "/home";
  const backLabel =
    backPath === "/notification"
      ? "Back to notifications"
      : backPath.startsWith("/profile/")
        ? "Back to profile"
        : "Back to home";
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const countedViewFor = useRef(null);

  const toggleLike = async () => {
    if (!post) return;
    const isLiked = Boolean(post.isLiked);
    const currentCount = post._count?.likes || 0;
    setPost((current) => ({
      ...current,
      isLiked: !isLiked,
      _count: {
        ...current._count,
        likes: Math.max(0, currentCount + (isLiked ? -1 : 1)),
      },
    }));

    try {
      if (isLiked) await unlikePost(post.id);
      else await likePost(post.id);
    } catch {
      setPost((current) => ({
        ...current,
        isLiked,
        _count: { ...current._count, likes: currentCount },
      }));
      setError("Could not update the post like.");
    }
  };

  const toggleFavorite = async () => {
    if (!post) return;
    const isFavorited = Boolean(post.isFavorited);
    setPost((current) => ({ ...current, isFavorited: !isFavorited }));

    try {
      if (isFavorited) await removeFavorite(post.id);
      else await addFavorite(post.id);
    } catch {
      setPost((current) => ({ ...current, isFavorited }));
      setError("Could not update the post bookmark.");
    }
  };

  const toggleRepost = async () => {
    if (!post) return;

    const isReposted = Boolean(post.isReposted);
    const currentCount = post._count?.reposts || 0;
    setPost((current) => ({
      ...current,
      isReposted: !isReposted,
      _count: {
        ...current._count,
        reposts: Math.max(0, currentCount + (isReposted ? -1 : 1)),
      },
    }));

    try {
      if (isReposted) await removeRepost(post.id);
      else await repostPost(post.id);
    } catch {
      setPost((current) => ({
        ...current,
        isReposted,
        _count: { ...current._count, reposts: currentCount },
      }));
      setError("Could not update the repost.");
    }
  };

  useEffect(() => {
    const loadPost = async () => {
      try {
        const [postResponse, likesResponse, favoritesResponse, repostResponse] =
          await Promise.all([
            getFeedById(id),
            getLikesByPost(id),
            getFavorites(),
            getRepostStatus(id),
          ]);

        const likes = likesResponse.data?.likes || [];
        const favorites = favoritesResponse.data || [];
        const nextPost = postResponse.data;

        setPost({
          ...nextPost,
          isLiked: likes.some(
            (like) => like.user?.id === currentUser?.id,
          ),
          isFavorited: favorites.some(
            (favorite) =>
              favorite.postId === id || favorite.post?.id === id,
          ),
          isReposted: Boolean(repostResponse.data),
        });
      } catch {
        setError("This yap is no longer available.");
      }
    };

    loadPost()
      .catch(() => setError("This yap is no longer available."))
      .finally(() => setLoading(false));
  }, [id, currentUser?.id]);

  useEffect(() => {
    // Stop if there is no post ID or this post was already counted.
    if (!id || countedViewFor.current === id) return;

    // Remember that this post's view has been counted.
    countedViewFor.current = id;

    // Increment the view count on the server.
    incrementView(id)
      .then((response) => {
        // Update the UI with the new count returned by the server.
        setPost((currentPost) =>
          currentPost
            ? {
                ...currentPost,
                viewCount: response.data.viewCount,
              }
            : currentPost,
        );
      })
      .catch(() => {
        // Ignore view-count errors so they do not break the post page.
      });
  }, [id]);

  if (loading)
    return (
      <div className="mx-auto max-w-2xl animate-pulse bg-neutral-200 p-8 dark:bg-neutral-900">
        <div className="h-5 w-32 rounded bg-neutral-300 dark:bg-neutral-800" />
      </div>
    );
  if (error || !post)
    return (
      <div className="mx-auto max-w-2xl border border-black/10 p-8 text-center dark:border-neutral-800">
        <p className="text-sm text-neutral-500">{error || "Post not found."}</p>
        <Link
          to="/home"
          className="mt-4 inline-block text-sm font-semibold text-indigo-500"
        >
          Back home
        </Link>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Link
        to={backPath}
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>
      <article className="border border-black/10 bg-white/60 p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-indigo-500/20 text-center font-bold text-indigo-600">
            {post.user?.imageUrl ? (
              <img
                src={post.user.imageUrl}
                alt={post.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center">
                {(post.user?.name || "Y")[0]}
              </span>
            )}
          </div>
          <div>
            <Link
              to={
                post.user?.username ? `/profile/${post.user.username}` : "/home"
              }
              className="text-sm font-bold"
            >
              {post.user?.name || "Yapper"}
            </Link>
            <p className="text-xs text-neutral-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {post.content && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
            <LinkifiedText text={post.content} />
          </p>
        )}
        {post.images?.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {post.images.map((image) => (
              <img
                key={image.id || image.url}
                src={image.url}
                alt="Post attachment"
                className="max-h-96 w-full object-cover"
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-1.5 border-t border-black/5 pt-3 text-xs font-semibold text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("comments")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            aria-label="View comments"
            className="flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post._count?.comments || 0}</span>
          </button>
          <button
            type="button"
            onClick={toggleLike}
            aria-label={post.isLiked ? "Unlike post" : "Like post"}
            className={`flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 hover:bg-rose-500/10 hover:text-rose-500 ${post.isLiked ? "text-rose-500" : ""}`}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
            <span>{post._count?.likes || 0}</span>
          </button>
          <button
            type="button"
            aria-label="View post activity"
            className="flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600"
          >
            <ChartColumn className="h-4 w-4" />
            <span>{post.viewCount || 0}</span>
          </button>
          <button
            type="button"
            onClick={toggleRepost}
            aria-label={post.isReposted ? "Remove repost" : "Repost post"}
            className={`flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600 ${post.isReposted ? "text-emerald-600 dark:text-emerald-400" : ""}`}
          >
            <Repeat2 className="h-4 w-4" />
            <span>{post._count?.reposts || 0}</span>
          </button>
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={post.isFavorited ? "Remove post bookmark" : "Bookmark post"}
            className={`flex min-h-8 min-w-8 items-center justify-center rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600 ${post.isFavorited ? "text-indigo-600 dark:text-indigo-400" : ""}`}
          >
            <Bookmark className={`h-4 w-4 ${post.isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>
      </article>
      <CommentSection postId={post.id} />
    </div>
  );
}
