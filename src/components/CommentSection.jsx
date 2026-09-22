import { Ellipsis, Pencil, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createComment, getCommentsByPost } from "../api/comment";
import { deleteComment, updateComment } from "../api/commentActions";
import { useAuth } from "../hooks/useAuth";

const relativeTime = (value) => {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState("");
  const commentInputRef = useRef(null);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);

  const loadComments = useCallback(async () => {
    try {
      const response = await getCommentsByPost(postId);
      setComments(response.data || []);
    } catch {
      setError("Could not load comments.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const loadId = window.setTimeout(loadComments, 0);
    return () => window.clearTimeout(loadId);
  }, [loadComments]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await createComment(postId, trimmedContent);
      setComments((current) => [...current, response.data]);
      setContent("");
      if (commentInputRef.current)
        commentInputRef.current.style.height = "auto";
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not post your comment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleContentChange = (event) => {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setContent(textarea.value);
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((current) =>
        current.filter((comment) => comment.id !== commentId),
      );
    } catch {
      setError("Could not delete that comment.");
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content || "");
    setOpenCommentMenuId(null);
    setError("");
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleEdit = async (commentId) => {
    const trimmedContent = editContent.trim();
    if (!trimmedContent) return;

    try {
      const response = await updateComment(commentId, trimmedContent);
      const updatedComment = response.data || response;
      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? { ...comment, ...updatedComment, content: trimmedContent }
            : comment,
        ),
      );
      cancelEditing();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not edit that comment.",
      );
    }
  };

  return (
    <section className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
      <h2 className="text-sm font-bold">
        Comments{" "}
        <span className="font-normal text-neutral-500">
          ({comments.length})
        </span>
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
        <textarea
          ref={commentInputRef}
          value={content}
          onChange={handleContentChange}
          maxLength={500}
          rows={2}
          placeholder="Add a comment…"
          className="w-full resize-none overflow-hidden rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700"
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          aria-label="Post comment"
          className="rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
      <div className="mt-5 space-y-4">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No comments yet. Start the conversation.
          </p>
        ) : (
          comments.map((comment) => {
            const author = comment.user || {};
            const isOwnComment =
              author.id === user?.id || comment.userId === user?.id;
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-indigo-500/20 text-center text-xs font-bold text-indigo-600 dark:text-indigo-300">
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
                <div className="relative min-w-0 flex-1 rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">
                      {author.name || "Yapper"}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {relativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <div className="flex w-full items-start justify-between gap-2">
                    {editingCommentId === comment.id ? (
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <textarea
                          value={editContent}
                          onChange={(event) =>
                            setEditContent(event.target.value)
                          }
                          maxLength={500}
                          rows={2}
                          autoFocus
                          className="w-full resize-none overflow-hidden break-words rounded-lg border border-indigo-500/40 bg-transparent px-2 py-1.5 text-sm outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-lg px-2 py-1 text-xs text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(comment.id)}
                            disabled={!editContent.trim()}
                            className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 min-w-0 whitespace-pre-wrap break-words text-sm text-neutral-700 dark:text-neutral-300">
                        {comment.content}
                      </p>
                    )}
                    {isOwnComment && editingCommentId !== comment.id && (
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCommentMenuId((currentId) =>
                              currentId === comment.id ? null : comment.id,
                            )
                          }
                          aria-label="Comment options"
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-black/5 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                        >
                          <Ellipsis className="h-4 w-4" />
                        </button>
                        {openCommentMenuId === comment.id && (
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
                              onClick={() => {
                                setOpenCommentMenuId(null);
                                handleDelete(comment.id);
                              }}
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
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
