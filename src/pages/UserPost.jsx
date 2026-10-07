import { useCallback, useEffect, useRef, useState } from "react";
import { getLikesByPost, likePost, unlikePost } from "../api/like";
import { addFavorite, removeFavorite } from "../api/favorite";
import { deleteFeed, editFeed, getPostsByUser } from "../api/post";
import ImageLightbox from "../components/ImageLightbox";
import PostCard from "../components/PostCard";
import UserPostSkeleton from "../components/UserPostSkeleton";
import { useAuth } from "../hooks/useAuth";
import { showSuccessToast } from "../utils/toast";

export default function UserPost({ userId, profileUsername }) {
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [likingPostIds, setLikingPostIds] = useState(new Set());
  const [favoritingPostIds, setFavoritingPostIds] = useState(new Set());
  const [activeModal, setActiveModal] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  const fetchUserPosts = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (!userId) return;

      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const res = await getPostsByUser(userId, pageToLoad);
        const userPosts = res.data?.posts || [];
        const postsWithLikeState = await Promise.all(
          userPosts.map(async (post) => {
            try {
              const likesResponse = await getLikesByPost(post.id);
              const { count, likes } = likesResponse?.data || {};
              return {
                ...post,
                isLiked: (likes || []).some(
                  (like) => like.user?.id === currentUser?.id,
                ),
                _count: {
                  ...post._count,
                  likes: count ?? post._count?.likes ?? 0,
                },
              };
            } catch {
              return post;
            }
          }),
        );
        setPosts((previousPosts) =>
          append
            ? [...previousPosts, ...postsWithLikeState]
            : postsWithLikeState,
        );
        const pagination = res.data?.pagination;
        setPage(pagination?.page || pageToLoad);
        setHasMore(
          Boolean(pagination && pagination.page < pagination.totalPages),
        );
      } catch (err) {
        console.error("Failed to load user posts:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId, currentUser?.id],
  );

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasMore || loadingMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchUserPosts(page + 1, true);
      },
      { rootMargin: "240px" },
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [fetchUserPosts, hasMore, loadingMore, page]);

  const startEditing = (post) => {
    setEditingPostId(post._id || post.id);
    setEditText(post.content || "");
    setOpenMenuPostId(null);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditText("");
  };

  const handleEdit = async (postId) => {
    if (!editText.trim()) return;

    try {
      const response = await editFeed(postId, { content: editText.trim() });
      const updatedPost = response.data?.data || response.data || response;
      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          (post._id || post.id) === postId
            ? {
                ...post,
                ...updatedPost,
                content: updatedPost.content || editText.trim(),
              }
            : post,
        ),
      );
      cancelEditing();
    } catch (err) {
      console.error("Failed to edit post:", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deleteFeed(postId);
      setPosts((previousPosts) =>
        previousPosts.filter((post) => (post._id || post.id) !== postId),
      );
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleLikeToggle = async (postId, isLiked) => {
    const previousPosts = posts;
    const currentPost = posts.find((post) => (post._id || post.id) === postId);
    const currentCount = currentPost?._count?.likes ?? currentPost?.likes ?? 0;
    const nextCount = Math.max(0, currentCount + (isLiked ? -1 : 1));

    setLikingPostIds((ids) => new Set(ids).add(postId));
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        (post._id || post.id) === postId
          ? {
              ...post,
              isLiked: !isLiked,
              _count: { ...post._count, likes: nextCount },
            }
          : post,
      ),
    );

    try {
      if (isLiked) await unlikePost(postId);
      else await likePost(postId);
    } catch (err) {
      console.error("Failed to update like state:", err);
      setPosts(previousPosts);
    } finally {
      setLikingPostIds((ids) => {
        const nextIds = new Set(ids);
        nextIds.delete(postId);
        return nextIds;
      });
    }
  };

  const handleFavoriteToggle = async (postId, isFavorited) => {
    if (!postId || favoritingPostIds.has(postId)) return;

    const previousPosts = posts;
    setFavoritingPostIds((ids) => new Set(ids).add(postId));
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        (post._id || post.id) === postId
          ? { ...post, isFavorited: !isFavorited }
          : post,
      ),
    );

    try {
      if (isFavorited) await removeFavorite(postId);
      else await addFavorite(postId);
      showSuccessToast(
        isFavorited ? "Removed from favorites." : "Saved to favorites.",
      );
    } catch (err) {
      console.error("Failed to update post favorite:", err);
      setPosts(previousPosts);
    } finally {
      setFavoritingPostIds((ids) => {
        const nextIds = new Set(ids);
        nextIds.delete(postId);
        return nextIds;
      });
    }
  };

  const openModal = (images, currentIndex) =>
    setActiveModal({ images, currentIndex });
  const closeModal = () => setActiveModal(null);
  const moveModal = (direction) => {
    setActiveModal((modal) => ({
      ...modal,
      currentIndex:
        (modal.currentIndex + direction + modal.images.length) %
        modal.images.length,
    }));
  };

  if (loading) {
    return (
      <div className="-mt-px space-y-0">
        <UserPostSkeleton />
        <UserPostSkeleton />
        <UserPostSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-px">
        {posts.length === 0 ? (
          <div className="flex min-h-36 items-center justify-center border-x border-b border-black/10 bg-white/60 px-6 py-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No posts yet.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              currentUser={currentUser}
              openMenuPostId={openMenuPostId}
              setOpenMenuPostId={setOpenMenuPostId}
              editingPostId={editingPostId}
              editText={editText}
              setEditText={setEditText}
              startEditing={startEditing}
              cancelEditing={cancelEditing}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleLikeToggle={handleLikeToggle}
              likingPostIds={likingPostIds}
              handleFavoriteToggle={handleFavoriteToggle}
              favoritingPostIds={favoritingPostIds}
              openModal={openModal}
              postDetailFrom={
                profileUsername ? `/profile/${profileUsername}` : "/home"
              }
            />
          ))
        )}
        {hasMore && (
          <div ref={loadMoreRef} className="w-full py-4">
            {loadingMore && (
              <div className="mt-5 space-y-0">
                <UserPostSkeleton />
                <UserPostSkeleton />
                <UserPostSkeleton />
              </div>
            )}
          </div>
        )}
      </div>
      {activeModal && (
        <ImageLightbox
          images={activeModal.images}
          currentIndex={activeModal.currentIndex}
          onClose={closeModal}
          onPrevious={() => moveModal(-1)}
          onNext={() => moveModal(1)}
        />
      )}
    </>
  );
}
