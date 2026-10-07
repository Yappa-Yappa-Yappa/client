import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { getPostsByUser } from "../../api/post";

export default function ProfileMedia() {
  const { profile } = useOutletContext();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getPostsByUser(profile.id, 1, 100)
      .then((response) => {
        if (cancelled) return;

        const posts = response.data?.posts || [];
        setMedia(
          posts.flatMap((post) =>
            (post.images || []).map((image) => ({
              ...image,
              postId: post.id,
            })),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setMedia([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  if (loading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-1 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="aspect-square bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex min-h-36 items-center justify-center border-x border-b border-black/10 bg-white/60 px-6 py-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No media yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1 border-x border-b border-black/10 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60 sm:grid-cols-3">
      {media.map((image) => (
        <Link
          key={image.id || `${image.postId}-${image.url}`}
          to={`/post/${image.postId}`}
          state={{ from: `/profile/${profile.username}/media` }}
          className="group aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-950"
          aria-label="Open post"
        >
          <img
            src={image.url}
            alt="Post media"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
      ))}
    </div>
  );
}
