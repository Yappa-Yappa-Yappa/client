import { Repeat2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRepostsByUser } from "../../api/repost";

export default function ProfileReposts() {
  const { username } = useParams();
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getRepostsByUser(username)
      .then((response) => {
        if (!cancelled) setReposts(response.data || []);
      })
      .catch(() => {
        if (!cancelled) setReposts([]);
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

  if (reposts.length === 0) {
    return (
      <div className="border-x border-b border-black/10 bg-white/60 px-6 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No reposts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-px">
      {reposts.map(({ id, createdAt, post }) => (
        <article
          key={id}
          className="border-x border-b border-black/10 bg-white/60 p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          <div className="mb-3 flex items-center gap-2 text-xs text-neutral-500">
            <Repeat2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Reposted {new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-indigo-500/20 text-center font-bold text-indigo-600 dark:text-indigo-300">
              {post.user?.imageUrl ? (
                <img
                  src={post.user.imageUrl}
                  alt={post.user.name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center">
                  {(post.user?.name || "Y")[0]}
                </span>
              )}
            </div>
            <Link
              to={`/profile/${post.user?.username}`}
              className="text-sm font-semibold text-neutral-900 hover:text-indigo-600 dark:text-neutral-100 dark:hover:text-indigo-400"
            >
              {post.user?.name || "Yapper"}
            </Link>
          </div>
          {post.content && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
              {post.content}
            </p>
          )}
          {post.images?.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {post.images.map((image) => (
                <img
                  key={image.id || image.url}
                  src={image.url}
                  alt="Post attachment"
                  className="max-h-80 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
          <Link
            to={`/post/${post.id}`}
            className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View post
          </Link>
        </article>
      ))}
    </div>
  );
}
