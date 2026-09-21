import { Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createComment, getCommentsByPost } from "../api/comment";
import { deleteComment } from "../api/commentActions";
import { useAuth } from "../hooks/useAuth";

const relativeTime = (value) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
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
  const [error, setError] = useState("");

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
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not post your comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
    } catch {
      setError("Could not delete that comment.");
    }
  };

  return (
    <section className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
      <h2 className="text-sm font-bold">Comments <span className="font-normal text-neutral-500">({comments.length})</span></h2>
      <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
        <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={500} rows={2} placeholder="Add a comment…" className="w-full resize-none rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
        <button type="submit" disabled={!content.trim() || submitting} aria-label="Post comment" className="rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-500 disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
      <div className="mt-5 space-y-4">
        {loading ? <p className="text-sm text-neutral-500">Loading comments…</p> : comments.length === 0 ? <p className="text-sm text-neutral-500">No comments yet. Start the conversation.</p> : comments.map((comment) => {
          const author = comment.user || {};
          const isOwnComment = author.id === user?.id || comment.userId === user?.id;
          return <div key={comment.id} className="flex gap-3"><div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-indigo-500/20 text-center text-xs font-bold text-indigo-600 dark:text-indigo-300">{author.imageUrl ? <img src={author.imageUrl} alt={author.name || "Yapper"} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center">{(author.name || "Y")[0].toUpperCase()}</span>}</div><div className="min-w-0 flex-1 rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-800"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold">{author.name || "Yapper"}</span><span className="text-[11px] text-neutral-500">{relativeTime(comment.createdAt)}</span></div><p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">{comment.content}</p></div>{isOwnComment && <button onClick={() => handleDelete(comment.id)} aria-label="Delete comment" className="self-center rounded-lg p-1.5 text-neutral-400 hover:bg-rose-500/10 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>}</div>;
        })}
      </div>
    </section>
  );
}
