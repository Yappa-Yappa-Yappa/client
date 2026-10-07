import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCommentsByUser } from "../../api/user";

export default function ProfileReplies() {
  const { username } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCommentsByUser(username)
      .then((response) => {
        if (!cancelled) setComments(response.data || []);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-px">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 border-x border-b border-black/10 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
          />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex min-h-36 items-center justify-center border-x border-b border-black/10 bg-white/60 px-6 py-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No comments yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-px">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className="border-x border-b border-black/10 bg-white/60 p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <MessageCircle className="h-4 w-4 text-indigo-500" />
            <span>Commented on</span>
            <Link
              to={`/profile/${comment.post.user.username}`}
              className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {comment.post.user.name}
            </Link>
          </div>
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
            {comment.content}
          </p>
          {comment.images?.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {comment.images.map((image) => (
                <img
                  key={image.id || image.url}
                  src={image.url}
                  alt="Comment attachment"
                  className="h-28 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
          <Link
            to={`/post/${comment.post.id}`}
            state={{ from: `/profile/${username}/comments` }}
            className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View post
          </Link>
        </article>
      ))}
    </div>
  );
}
