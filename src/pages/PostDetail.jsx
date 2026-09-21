import { ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getFeedById } from "../api/post";
import CommentSection from "../components/CommentSection";

export default function PostDetail() {
  const { id } = useParams();
  const location = useLocation();
  const backPath = location.state?.from || "/home";
  const backLabel =
    backPath === "/notification" ? "Back to notifications" : "Back to home";
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFeedById(id)
      .then((response) => setPost(response.data))
      .catch(() => setError("This yap is no longer available."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="mx-auto max-w-2xl animate-pulse rounded-2xl bg-neutral-200 p-8 dark:bg-neutral-900">
        <div className="h-5 w-32 rounded bg-neutral-300 dark:bg-neutral-800" />
      </div>
    );
  if (error || !post)
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-black/10 p-8 text-center dark:border-neutral-800">
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
      <article className="rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
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
            {post.content}
          </p>
        )}
        {post.images?.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {post.images.map((image) => (
              <img
                key={image.id || image.url}
                src={image.url}
                alt="Post attachment"
                className="max-h-96 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-2 border-t border-black/5 pt-3 text-xs text-neutral-500 dark:border-neutral-800">
          <MessageCircle className="h-4 w-4" /> Join the conversation
        </div>
      </article>
      <CommentSection postId={post.id} />
    </div>
  );
}
