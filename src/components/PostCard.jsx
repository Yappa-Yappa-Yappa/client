import {
  Bookmark,
  Heart,
  MessageSquare,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import LinkifiedText from "./LinkifiedText";

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

const getGridClass = (count) => {
  if (count === 1) return "grid-cols-1";
  if (count === 5) return "grid-cols-3";
  return "grid-cols-2";
};

export default function PostCard({
  post,
  currentUser,
  openMenuPostId,
  setOpenMenuPostId,
  editingPostId,
  editText,
  setEditText,
  startEditing,
  cancelEditing,
  handleEdit,
  handleDelete,
  handleLikeToggle,
  likingPostIds,
  openModal,
}) {
  const navigate = useNavigate();
  const [shareStatus, setShareStatus] = useState("");
  const postId = post._id || post.id;
  const authorId = post.userId || post.user?.id || post.authorId;
  const isOwnPost = Boolean(currentUser?.id && authorId === currentUser.id);
  const authorName = post.user?.name || post.authorName || post.author || "Yapper";
  const avatarUrl = post.user?.imageUrl;
  const username =
    post.user?.username ||
    post.username ||
    authorName.toLowerCase().replace(/\s+/g, "");
  const postImages = post.images?.length
    ? post.images.map((img) =>
        typeof img === "string" ? img : img.url || img.path,
      )
    : post.image || post.imageUrl
      ? [post.image || post.imageUrl]
      : [];

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    const shareData = {
      title: `${authorName}'s yap on Yappa Yappa`,
      text: post.content?.slice(0, 120) || "Check out this yap on Yappa Yappa.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("Link copied");
      }
      window.setTimeout(() => setShareStatus(""), 2200);
    } catch (error) {
      if (error?.name !== "AbortError") setShareStatus("Could not share");
      window.setTimeout(() => setShareStatus(""), 2200);
    }
  };

  return (
    <article className="p-5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-neutral-800/80 hover:border-black/20 dark:hover:border-neutral-700/80 transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <NavLink
          to={`/profile/${post.user?.username || username}`}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt={authorName} className="h-full w-full object-cover" />
            ) : (
              authorName[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              {authorName}
            </h4>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              @{username}
            </span>
          </div>
        </NavLink>

        <div className="relative flex items-center gap-2">
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            {formatRelativeTime(post.createdAt)}
          </span>
          <button
            onClick={() =>
              setOpenMenuPostId((currentId) =>
                currentId === postId ? null : postId,
              )
            }
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Post options"
            aria-label="Post options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {openMenuPostId === postId && (
            <div className="absolute right-0 top-8 z-10 min-w-36 overflow-hidden rounded-xl border border-black/10 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl">
              {isOwnPost ? (
                <>
                  <button
                    onClick={() => startEditing(post)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setOpenMenuPostId(null);
                      handleDelete(postId);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setOpenMenuPostId(null)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Save post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {editingPostId === postId ? (
        <div className="mb-3 space-y-2">
          <textarea
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            rows={3}
            autoFocus
            className="w-full resize-none rounded-xl border border-indigo-500/40 bg-transparent p-3 text-sm leading-relaxed text-neutral-800 outline-none dark:text-neutral-200"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelEditing}
              className="rounded-lg px-3 py-1.5 text-xs text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => handleEdit(postId)}
              disabled={!editText.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </div>
      ) : post.content ? (
        <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 mb-3 whitespace-pre-line">
          <LinkifiedText text={post.content} />
        </p>
      ) : null}

      {postImages.length > 0 && (
        <div
          className={`grid gap-1.5 mb-3 rounded-2xl overflow-hidden border border-black/10 dark:border-neutral-800 ${getGridClass(postImages.length)}`}
        >
          {postImages.map((src, index) => (
            <button
              type="button"
              key={`${src}-${index}`}
              onClick={() => openModal(postImages, index)}
              className={`cursor-pointer overflow-hidden group bg-neutral-100 dark:bg-neutral-950 transition-colors text-left ${
                postImages.length === 1
                  ? "max-h-[420px]"
                  : postImages.length === 5 && index < 2
                    ? "h-40 col-span-1"
                    : "h-36"
              }`}
            >
              <img
                src={src}
                alt="Attachment"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-8 pt-3 border-t border-black/5 dark:border-neutral-800/60 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        <button
          onClick={() => handleLikeToggle(postId, Boolean(post.isLiked))}
          disabled={likingPostIds.has(postId)}
          className={`flex items-center gap-2 transition-colors active:scale-95 ${
            post.isLiked
              ? "text-rose-500"
              : "hover:text-rose-500 dark:hover:text-rose-400"
          } disabled:opacity-50`}
        >
          <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current text-rose-500" : ""}`} />
          <span>{post._count?.likes ?? post.likes ?? 0}</span>
        </button>
        <button onClick={() => navigate(`/post/${postId}`, { state: { from: "/home" } })} className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span>{post._count?.comments || post.comments || 0}</span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share post"
          title={shareStatus || "Share post"}
          className="ml-auto flex items-center gap-2 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <Share2 className="w-4 h-4" />
          {shareStatus && <span className="text-[11px] font-medium">{shareStatus}</span>}
        </button>
      </div>
    </article>
  );
}
