import {
  ArrowLeft,
  Bookmark,
  ChartColumn,
  CornerUpLeft,
  Ellipsis,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Pencil,
  Repeat2,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createComment, getCommentThread } from "../api/comment";
import { favoriteComment, unfavoriteComment } from "../api/commentFavorite";
import { deleteComment, updateComment } from "../api/commentActions";
import { likeComment, unlikeComment } from "../api/commentLike";
import { useAuth } from "../hooks/useAuth";
import ImageLightbox from "../components/ImageLightbox";

const relativeTime = (value) => {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  return Math.floor(seconds / 86400) + "d ago";
};

const replaceComment = (thread, commentId, updater) => ({
  ...thread,
  comment:
    thread.comment.id === commentId ? updater(thread.comment) : thread.comment,
  replies: thread.replies.map((reply) =>
    reply.id === commentId ? updater(reply) : reply,
  ),
});

export default function CommentThread() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyImages, setReplyImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeImages, setActiveImages] = useState(null);

  const openImages = (images, currentIndex) =>
    setActiveImages({
      images: images.map((image) => image.url || image),
      currentIndex,
    });

  const addReplyImages = (event) => {
    const selectedImages = Array.from(event.target.files || [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 3 - replyImages.length)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));

    setReplyImages((current) => [...current, ...selectedImages]);
    event.target.value = "";
  };

  const removeReplyImage = (preview) => {
    URL.revokeObjectURL(preview);
    setReplyImages((current) =>
      current.filter((image) => image.preview !== preview),
    );
  };

  const loadThread = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCommentThread(id);
      const data = response.data;
      const uniqueReplies = Array.from(
        new Map(
          (data.replies || [])
            .filter((reply) => reply.id !== data.comment?.id)
            .map((reply) => [reply.id, reply]),
        ).values(),
      );
      setThread({ ...data, replies: uniqueReplies });
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "This comment thread is no longer available.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const loadId = window.setTimeout(loadThread, 0);
    return () => window.clearTimeout(loadId);
  }, [loadThread]);

  const startReply = (comment) => {
    setReplyingTo(comment);
    setReplyContent("");
    setOpenMenuId(null);
    setError("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
    replyImages.forEach((image) => URL.revokeObjectURL(image.preview));
    setReplyImages([]);
  };

  const handleReply = async (event) => {
    event.preventDefault();
    const trimmedContent = replyContent.trim();
    if (
      (!trimmedContent && replyImages.length === 0) ||
      !replyingTo ||
      submitting ||
      !thread
    )
      return;

    setSubmitting(true);
    setError("");
    try {
      const response = await createComment(
        thread.comment.postId,
        trimmedContent,
        replyingTo.id,
        replyImages.map((image) => image.file),
      );
      const author = replyingTo.user || {};
      const reply = {
        ...response.data,
        parent: {
          id: replyingTo.id,
          user: { username: author.username },
        },
      };
      setThread((current) => ({
        ...current,
        replies: [...current.replies, reply],
      }));
      cancelReply();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not post your reply.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content || "");
    setOpenMenuId(null);
    setError("");
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleEdit = async (commentId) => {
    const trimmedContent = editContent.trim();
    if (!trimmedContent || !thread) return;

    try {
      const response = await updateComment(commentId, trimmedContent);
      const updatedComment = response.data || response;
      setThread((current) =>
        replaceComment(current, commentId, (comment) => ({
          ...comment,
          ...updatedComment,
          content: trimmedContent,
        })),
      );
      cancelEditing();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not edit that comment.",
      );
    }
  };

  const handleDelete = async (comment) => {
    try {
      await deleteComment(comment.id);
      if (comment.id === thread?.comment.id) {
        navigate("/post/" + thread.comment.postId);
        return;
      }
      await loadThread();
    } catch {
      setError("Could not delete that comment.");
    }
  };

  const toggleCommentLike = async (comment) => {
    const isLiked = Boolean(comment.isLiked);
    setThread((current) =>
      replaceComment(current, comment.id, (item) => ({
        ...item,
        isLiked: !isLiked,
        _count: {
          ...item._count,
          likes: Math.max(0, (item._count?.likes || 0) + (isLiked ? -1 : 1)),
        },
      })),
    );

    try {
      if (isLiked) await unlikeComment(comment.id);
      else await likeComment(comment.id);
    } catch {
      setThread((current) =>
        replaceComment(current, comment.id, (item) => ({
          ...item,
          isLiked,
          _count: {
            ...item._count,
            likes: Math.max(0, (item._count?.likes || 0) + (isLiked ? 1 : -1)),
          },
        })),
      );
      setError("Could not update that comment like.");
    }
  };

  const toggleCommentFavorite = async (comment) => {
    const isFavorited = Boolean(comment.isFavorited);
    setThread((current) =>
      replaceComment(current, comment.id, (item) => ({
        ...item,
        isFavorited: !isFavorited,
      })),
    );

    try {
      if (isFavorited) await unfavoriteComment(comment.id);
      else await favoriteComment(comment.id);
    } catch {
      setThread((current) =>
        replaceComment(current, comment.id, (item) => ({
          ...item,
          isFavorited,
        })),
      );
      setError("Could not update that comment bookmark.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-3 py-3 sm:px-0 sm:py-0">
        <div className="animate-pulse rounded-2xl bg-neutral-200 p-8 dark:bg-neutral-900">
        <div className="h-5 w-40 rounded bg-neutral-300 dark:bg-neutral-800" />
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="mx-auto max-w-2xl px-3 py-3 sm:px-0 sm:py-0">
        <div className="rounded-2xl border border-black/10 p-8 text-center dark:border-neutral-800">
        <p className="text-sm text-neutral-500">
          {error || "Comment not found."}
        </p>
        <Link
          to={location.state?.from || "/home"}
          className="mt-4 inline-block text-sm font-semibold text-indigo-500"
        >
          Go back
        </Link>
        </div>
      </div>
    );
  }

  const renderComment = (comment, isThreadRoot = false) => {
    const author = comment.user || {};
    const isOwnComment = author.id === user?.id || comment.userId === user?.id;
    const isEditing = editingCommentId === comment.id;

    return (
      <article
        key={comment.id}
        className={
          "rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 " +
          (!isThreadRoot ? "cursor-pointer" : "")
        }
            onClick={() => {
          if (!isThreadRoot) {
            navigate("/comment/" + comment.id, {
              state: { from: "/comment/" + id },
            });
          }
        }}
      >
        <div className="flex gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-indigo-500/20 text-center text-xs font-bold text-indigo-600 dark:text-indigo-300">
            {author.imageUrl ? (
              <img
                src={author.imageUrl}
                alt={author.name || "Yapper"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center">
                {(author.name || "Y")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">
                {author.name || "Yapper"}
              </span>
              <span className="text-xs text-neutral-500">
                {relativeTime(comment.createdAt)}
              </span>
            </div>
            {comment.parent?.user?.username && (
              <p className="mt-1 text-xs text-indigo-500">
                Replying to @{comment.parent.user.username}
              </p>
            )}
            {isEditing ? (
              <div
                className="mt-3 space-y-2"
                onClick={(event) => event.stopPropagation()}
              >
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  maxLength={500}
                  rows={3}
                  autoFocus
                  className="w-full resize-none rounded-xl border border-indigo-500/40 bg-transparent px-3 py-2 text-sm outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-lg px-3 py-1.5 text-xs text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(comment.id)}
                    disabled={!editContent.trim()}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {comment.content}
              </p>
            )}
            {comment.images?.length > 0 && (
              <div className="mt-2 grid max-w-sm grid-cols-3 gap-2">
                {comment.images.map((image, index) => (
                  <button
                    type="button"
                    key={image.id || image.url}
                    onClick={(event) => {
                      event.stopPropagation();
                      openImages(comment.images, index);
                    }}
                    className="overflow-hidden rounded-lg"
                    aria-label="Open comment image"
                  >
                    <img
                      src={image.url}
                      alt="Comment attachment"
                      className="h-20 w-full object-cover transition hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            )}
            <div
              className="relative -ml-[48px] mt-3 flex w-[calc(100%+48px)] items-center justify-between gap-1 border-t border-black/5 pt-2 text-xs font-semibold text-neutral-500 dark:border-neutral-700/60 dark:text-neutral-400"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  startReply(comment);
                }}
                aria-label="Reply to comment"
                className="flex min-h-8 min-w-8 items-center justify-center rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600"
              >
                <CornerUpLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate("/comment/" + comment.id, {
                    state: { from: "/comment/" + id },
                  })
                }
                aria-label="View comment thread"
                className="flex min-h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{comment._count?.replies || 0}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleCommentLike(comment)}
                aria-label={comment.isLiked ? "Unlike comment" : "Like comment"}
                className={`flex min-h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-1.5 hover:bg-rose-500/10 hover:text-rose-500 ${comment.isLiked ? "text-rose-500" : ""}`}
              >
                <Heart
                  className={`h-4 w-4 ${comment.isLiked ? "fill-current" : ""}`}
                />
                <span>{comment._count?.likes || 0}</span>
              </button>
              <button
                type="button"
                aria-label="View comment activity"
                title="Comment activity coming soon"
                className="flex min-h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600"
              >
                <ChartColumn className="h-4 w-4" />
                <span>{comment.viewCount || 0}</span>
              </button>
              <button
                type="button"
                aria-label="Repost comment"
                title="Comment reposts coming soon"
                className="flex min-h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600"
              >
                <Repeat2 className="h-4 w-4" />
                <span>{comment.repostCount || 0}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleCommentFavorite(comment)}
                aria-label={
                  comment.isFavorited
                    ? "Remove comment bookmark"
                    : "Bookmark comment"
                }
                title={
                  comment.isFavorited ? "Remove bookmark" : "Bookmark comment"
                }
                className={`flex min-h-8 min-w-8 items-center justify-center rounded-lg px-1.5 hover:bg-indigo-500/10 hover:text-indigo-600 ${comment.isFavorited ? "text-indigo-600 dark:text-indigo-400" : ""}`}
              >
                <Bookmark
                  className={`h-4 w-4 ${comment.isFavorited ? "fill-current" : ""}`}
                />
              </button>
              {isOwnComment && !isEditing && (
                <div
                  className="relative"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === comment.id ? null : comment.id,
                      )
                    }
                    aria-label="Comment options"
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-black/5 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  >
                    <Ellipsis className="h-4 w-4" />
                  </button>
                  {openMenuId === comment.id && (
                    <div className="absolute right-0 top-8 z-10 min-w-28 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                      <button
                        type="button"
                        onClick={() => startEditing(comment)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comment)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {replyingTo?.id === comment.id && (
              <form
                onSubmit={handleReply}
                onClick={(event) => event.stopPropagation()}
                className="mt-2 flex flex-col gap-2 rounded-xl border border-black/10 bg-white/50 p-2 dark:border-neutral-700 dark:bg-neutral-900/50 sm:flex-row sm:items-end"
              >
                <div className="min-w-0 flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(event) => setReplyContent(event.target.value)}
                    maxLength={500}
                    rows={2}
                    autoFocus
                    placeholder={
                      "Reply to " +
                      (author.username ? "@" + author.username : "this comment")
                    }
                    className="w-full resize-none rounded-xl border border-indigo-500/40 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                  {replyImages.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {replyImages.map((image) => (
                        <div key={image.preview} className="relative h-16 w-16">
                          <img
                            src={image.preview}
                            alt="Reply preview"
                            className="h-full w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeReplyImage(image.preview)}
                            className="absolute -right-1.5 -top-1.5 rounded-full bg-neutral-900 p-0.5 text-white"
                            aria-label="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {replyImages.length < 3 && (
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 hover:bg-indigo-500/10 hover:text-indigo-600">
                      <ImageIcon className="h-4 w-4" />
                      Add image/GIF
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={addReplyImages}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 sm:shrink-0">
                  <button
                    type="submit"
                    disabled={
                      (!replyContent.trim() && replyImages.length === 0) ||
                      submitting
                    }
                    aria-label="Post reply"
                    className="rounded-xl bg-indigo-600 p-2.5 text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="rounded-lg px-2 py-2 text-xs text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <>
      <div className="mx-auto w-full max-w-2xl space-y-4 px-3 py-3 sm:px-0 sm:py-0">
      <button
        type="button"
        onClick={() =>
          navigate(location.state?.from || "/post/" + thread.comment.postId)
        }
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div>
        <h1 className="text-lg font-bold">Comment</h1>
        <p className="text-xs text-neutral-500">
          {thread.replies.length}{" "}
          {thread.replies.length === 1 ? "reply" : "replies"}
        </p>
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      {renderComment(thread.comment, true)}
      <div className="space-y-3 border-l-2 border-indigo-500/20 pl-4">
        {thread.replies.length === 0 ? (
          <p className="py-4 text-sm text-neutral-500">
            No replies yet. Start the conversation.
          </p>
        ) : (
          thread.replies.map((reply) => renderComment(reply))
        )}
      </div>
      </div>
      {activeImages && (
        <ImageLightbox
          images={activeImages.images}
          currentIndex={activeImages.currentIndex}
          onClose={() => setActiveImages(null)}
          onPrevious={() =>
            setActiveImages((current) => ({
              ...current,
              currentIndex:
                (current.currentIndex - 1 + current.images.length) %
                current.images.length,
            }))
          }
          onNext={() =>
            setActiveImages((current) => ({
              ...current,
              currentIndex:
                (current.currentIndex + 1) % current.images.length,
            }))
          }
        />
      )}
    </>
  );
}
