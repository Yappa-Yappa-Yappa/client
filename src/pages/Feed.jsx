import { useState, useEffect, useRef, useCallback } from "react";
import {
  Image as ImageIcon,
  Send,
  Heart,
  MessageCircle,
  Trash2,
  MoreVertical,
  Pencil,
  Bookmark,
  Loader2,
  X,
  ChartColumn,
  Repeat2,
  Share2,
  Flag,
} from "lucide-react";
import {
  deleteFeed,
  editFeed,
  getFeeds,
  getFollowingPosts,
  postFeed,
} from "../api/post";
import { getLikesByPost, likePost, unlikePost } from "../api/like";
import { useAuth } from "../hooks/useAuth";
import FeedSkeleton from "../components/FeedSkeleton";
import LinkifiedText from "../components/LinkifiedText";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { addFavorite, removeFavorite } from "../api/favorite";
import ImageLightbox from "../components/ImageLightbox";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../utils/toast";

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

export default function Feed({ feedType = "for-you" }) {
  const navigate = useNavigate();

  const openPost = (postId) => {
    navigate(`/post/${postId}`, { state: { from: "/home" } });
  };

  const handlePostClick = (event, postId) => {
    // Leave buttons, links, inputs, and image interactions to their own handlers.
    if (event.target.closest("button, a, input, textarea, select")) return;
    openPost(postId);
  };

  const handlePostKeyDown = (event, postId) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openPost(postId);
  };
  const [postText, setPostText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likingPostIds, setLikingPostIds] = useState(new Set());
  const [favoritingPostIds, setFavoritingPostIds] = useState(new Set());
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [shareStatus, setShareStatus] = useState("");

  // Lightbox Modal State
  const [activeModal, setActiveModal] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  const fileInputRef = useRef(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    if (!openMenuPostId) return;

    const handleOutsideMenuClick = (event) => {
      if (
        !event.target.closest("[data-post-menu]") &&
        !event.target.closest("[data-post-menu-trigger]")
      ) {
        setOpenMenuPostId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideMenuClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideMenuClick);
  }, [openMenuPostId]);

  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      if (pageNum > 1 && loadingMoreRef.current) return;
      if (pageNum > 1) loadingMoreRef.current = true;

      try {
        setLoading(true);
        setError(null);
        const response =
          feedType === "following"
            ? await getFollowingPosts(pageNum, 20)
            : await getFeeds(pageNum, 20);
        const { posts: newPosts, pagination } = response.data;

        setHasMore(pagination.page < pagination.totalPages);
        setPage(pagination.page);

        const postsWithLikeState = await Promise.all(
          newPosts.map(async (post) => {
            const postId = post.id;
            if (!postId || !user?.id) return post;

            try {
              const likesResponse = await getLikesByPost(postId);
              const { count: likeCount, likes } = likesResponse?.data || {};

              return {
                ...post,
                isLiked: (likes || []).some(
                  (like) => like.user?.id === user.id,
                ),
                _count: { ...post._count, likes: likeCount },
              };
            } catch (err) {
              console.error(`Failed to load likes for post ${postId}:`, err);
              return post;
            }
          }),
        );
        setPosts((prev) => {
          if (pageNum === 1) return postsWithLikeState;
          return [...prev, ...postsWithLikeState];
        });
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Unable to load posts. Please try again.");
      } finally {
        setLoading(false);
        if (pageNum > 1) loadingMoreRef.current = false;
      }
    },
    [user, feedType],
  );

  useEffect(() => {
    // Initial feed loading is intentionally triggered when the signed-in user changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, [fetchPosts]);

  const handleImageFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + imageFiles.length > 5) {
      showWarningToast("You can only upload a maximum of 5 images per post.");
      return;
    }

    const updatedFiles = [...imageFiles, ...selectedFiles].slice(0, 5);
    setImageFiles(updatedFiles);

    const previews = updatedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleShare = async (sharedPost) => {
    const sharedPostId = sharedPost._id || sharedPost.id;
    const sharedAuthorName =
      sharedPost.user?.name ||
      sharedPost.authorName ||
      sharedPost.author ||
      "Yapper";

    const shareUrl = `${window.location.origin}/post/${sharedPostId}`;
    const shareData = {
      title: `${sharedAuthorName}'s yap on Yappa Yappa`,
      text:
        sharedPost.content?.slice(0, 120) ||
        "Check out this yap on Yappa Yappa.",
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
      if (error?.name !== "AbortError") {
        setShareStatus("Could not share");
        console.error("Share failed:", error);
      }
      window.setTimeout(() => setShareStatus(""), 2200);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);

    if (updatedFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if ((!postText.trim() && imageFiles.length === 0) || isSubmitting) return;

    try {
      setIsSubmitting(true);

      let payload;
      if (imageFiles.length > 0) {
        payload = new FormData();
        payload.append("content", postText);
        imageFiles.forEach((file) => {
          payload.append("images", file);
        });
      } else {
        payload = { content: postText };
      }

      const response = await postFeed(payload);
      const createdPost = response.data?.data || response.data || response;
      const postWithAuthor = {
        ...createdPost,
        user: createdPost.user || user,
        userId: createdPost.userId || user?.id,
        isLiked: false,
        _count: { likes: 0, comments: 0, ...createdPost._count },
      };

      setPosts((prevPosts) => [postWithAuthor, ...prevPosts]);
      setPostText("");
      clearAllImages();
      showSuccessToast("Your yap was published.");
    } catch (err) {
      console.error("Failed to create post:", err);
      showErrorToast("Failed to publish your yap.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFavorite = async (postId, isFavorited) => {
    if (!postId || favoritingPostIds.has(postId)) return;

    const previousPosts = posts;
    setFavoritingPostIds((ids) => new Set(ids).add(postId));
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
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
      console.error("Failed to update post favorite", err);
      setPosts(previousPosts);
      showErrorToast("Failed to update the post favorite.");
    } finally {
      setFavoritingPostIds((ids) => {
        const nextIds = new Set(ids);
        nextIds.delete(postId);
        return nextIds;
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFeed(id);
      setPosts((prevPosts) =>
        prevPosts.filter((post) => (post._id || post.id) !== id),
      );
      showSuccessToast("Post deleted.");
    } catch (err) {
      console.error("Failed to delete post:", err);
      showErrorToast("Could not delete post.");
    }
  };

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
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
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
      showSuccessToast("Yap updated.");
    } catch (err) {
      console.error("Failed to edit post:", err);
      showErrorToast("Could not edit Yap.");
    }
  };

  const handleLikeToggle = async (postId, isLiked) => {
    if (!postId || likingPostIds.has(postId)) return;

    const previousPosts = posts;
    const currentPost = posts.find((post) => (post._id || post.id) === postId);
    const currentCount = currentPost?._count?.likes ?? currentPost?.likes ?? 0;
    const nextCount = Math.max(0, currentCount + (isLiked ? -1 : 1));

    setLikingPostIds((ids) => new Set(ids).add(postId));
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        (post._id || post.id) === postId
          ? {
              ...post,
              isLiked: !isLiked,
              likes: nextCount,
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

  // Lightbox Modal Controls
  const openModal = (images, index) => {
    setActiveModal({
      isOpen: true,
      images,
      currentIndex: index,
    });
  };

  function closeModal() {
    setActiveModal({ isOpen: false, images: [], currentIndex: 0 });
  }

  function prevImage() {
    setActiveModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0
          ? prev.images.length - 1
          : prev.currentIndex - 1,
    }));
  }

  function nextImage() {
    setActiveModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === prev.images.length - 1
          ? 0
          : prev.currentIndex + 1,
    }));
  }

  const getGridClass = (count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 5) return "grid-cols-3";
    return "grid-cols-2";
  };

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (!scrollContainer) return undefined;

    const handleScroll = () => {
      if (
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 300 &&
        hasMore &&
        !loading &&
        !loadingMoreRef.current
      ) {
        fetchPosts(page + 1);
      }
    };
    scrollContainer.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loading, fetchPosts]);

  return (
    <div className="w-full mx-auto space-y-0">
      <div className="sticky top-0 z-10 flex h-[53px] w-full items-stretch border-b border-black/10 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#050508]/70">
        <Link
          to="/home"
          className={`relative flex flex-1 items-center justify-center text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
            feedType === "for-you"
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          For you
          {feedType === "for-you" && (
            <span className="absolute inset-x-1/4 bottom-0 h-1 rounded-full bg-indigo-500" />
          )}
        </Link>
        <Link
          to="/following"
          className={`relative flex flex-1 items-center justify-center text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
            feedType === "following"
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Following
          {feedType === "following" && (
            <span className="absolute inset-x-1/4 bottom-0 h-1 rounded-full bg-indigo-500" />
          )}
        </Link>
      </div>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Create Post Input Card */}
      <div className="p-4 bg-white/70 dark:bg-neutral-900/80 border border-black/10 dark:border-neutral-800 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors">
        <form onSubmit={handlePostSubmit}>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-indigo-500/20 text-center font-bold text-indigo-600 dark:text-indigo-300">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center">
                  {(user?.name || user?.username || "Y")[0].toUpperCase()}
                </span>
              )}
            </div>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's happening? Start yapping..."
              rows={3}
              className="min-w-0 flex-1 resize-none bg-transparent text-base leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>

          {/* Multi-Image Upload Previews */}
          {imagePreviews.length > 0 && (
            <div
              className={`grid gap-1.5 my-3 rounded-2xl overflow-hidden border border-black/10 dark:border-neutral-800 ${getGridClass(
                imagePreviews.length,
              )}`}
            >
              {imagePreviews.map((src, index) => (
                <div
                  key={index}
                  className={`relative group bg-neutral-100 dark:bg-neutral-950 overflow-hidden ${
                    imagePreviews.length === 1
                      ? ""
                      : imagePreviews.length === 5 && index < 2
                        ? "h-40 col-span-1"
                        : "h-36"
                  }`}
                >
                  <img
                    src={src}
                    alt={`Upload preview ${index + 1}`}
                    className={`block w-full ${
                      imagePreviews.length === 1
                        ? "h-auto max-h-[70vh] object-contain"
                        : "h-full object-cover"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors backdrop-blur-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-neutral-800">
            <button
              type="button"
              disabled={imageFiles.length >= 5}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <span className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                {imageFiles.length > 0 && `${imageFiles.length}/5`}
              </span>
            </button>

            <button
              type="submit"
              disabled={
                (!postText.trim() && imageFiles.length === 0) || isSubmitting
              }
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Yap</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {loading && posts.length === 0 && (
        <div className="flex justify-center py-10">
          <FeedSkeleton />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-0">
        {posts.map((post) => {
          const postId = post._id || post.id;
          const authorId = post.userId || post.user?.id || post.authorId;
          const isOwnPost = Boolean(user?.id && authorId === user.id);
          const authorName =
            post.user?.name || post.authorName || post.author || "Yapper";
          const avatarUrl = post.user?.imageUrl;
          const username =
            post.user?.username ||
            post.username ||
            `@${authorName.toLowerCase().replace(/\s+/g, "")}`;

          const postImages = post.images?.length
            ? post.images.map((img) =>
                typeof img === "string" ? img : img.url || img.path,
              )
            : post.image || post.imageUrl
              ? [post.image || post.imageUrl]
              : [];

          return (
            <article
              key={postId}
              onClick={(event) => handlePostClick(event, postId)}
              onKeyDown={(event) => handlePostKeyDown(event, postId)}
              tabIndex={0}
              role="link"
              className="cursor-pointer p-5 bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-neutral-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  <NavLink
                    to={`/profile/${post.user.username}`}
                    className={"flex items-center gap-2 shrink-0"}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={authorName}
                          className="h-full w-full object-cover"
                        />
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
                </div>

                <div className="relative flex items-center gap-2">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {formatRelativeTime(post.createdAt)}
                  </span>
                  <button
                    data-post-menu-trigger
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
                    <div
                      data-post-menu
                      className="absolute right-0 top-8 z-10 min-w-36 overflow-hidden rounded-xl border border-black/10 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl"
                    >
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
                        <div>
                          <button
                            type="button"
                            onClick={() => handleShare(post)}
                            aria-label="Share post"
                            title={shareStatus || "Share post"}
                            className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:text-neutral-200 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-400"
                          >
                            <Share2 className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110" />
                            {shareStatus && (
                              <span className="max-w-24 truncate text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                {shareStatus}
                              </span>
                            )}
                            {!shareStatus && <span>Share post</span>}
                          </button>
                          <button className="group relative flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 active:scale-[.98] dark:text-neutral-200 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-400">
                            <Flag className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110" />
                            <span>Report post</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {editingPostId === postId ? (
                <div className="mb-3 space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
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

              {/* Clickable Image Grid */}
              {postImages.length > 0 && (
                <div
                  className={`grid gap-1.5 mb-3 rounded-2xl overflow-hidden border border-black/10 dark:border-neutral-800 ${getGridClass(
                    postImages.length,
                  )}`}
                >
                  {postImages.map((src, idx) => (
                    <div
                      key={idx}
                      onClick={(event) => {
                        event.stopPropagation();
                        openModal(postImages, idx);
                      }}
                      className={`cursor-pointer overflow-hidden group bg-neutral-100 dark:bg-neutral-950 transition-colors ${
                        postImages.length === 1
                          ? ""
                          : postImages.length === 5 && idx < 2
                            ? "h-40 col-span-1"
                            : "h-36"
                      }`}
                    >
                      <img
                        src={src}
                        alt="Attachment"
                        className={`block w-full transition-transform duration-300 group-hover:scale-105 ${
                          postImages.length === 1
                            ? "h-auto max-h-[70vh] object-contain"
                            : "h-full object-cover"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between gap-1.5 border-t border-black/5 pt-3 text-xs font-semibold text-neutral-500 dark:border-neutral-800/60 dark:text-neutral-400">
                <button
                  onClick={() => openPost(postId)}
                  aria-label="View comments"
                  className="flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post._count?.comments || post.comments || 0}</span>
                </button>

                {/* Heart Button */}
                <button
                  onClick={() =>
                    handleLikeToggle(postId, Boolean(post.isLiked))
                  }
                  disabled={likingPostIds.has(postId)}
                  aria-label={post.isLiked ? "Unlike post" : "Like post"}
                  className={`flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 ${
                    post.isLiked
                      ? "text-rose-500"
                      : "hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-400/10 dark:hover:text-rose-400"
                  } disabled:opacity-50`}
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      post.isLiked ? "fill-current text-rose-500" : ""
                    }`}
                  />
                  <span>{post._count?.likes ?? post.likes ?? 0}</span>
                </button>

                <button
                  aria-label="View post analytics"
                  className="flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-400"
                >
                  <ChartColumn className="w-4 h-4" />
                  <span>{post.viewCount ?? post._count?.viewCount ?? 0}</span>
                </button>

                <button
                  aria-label="Repost"
                  className="flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-400"
                >
                  <Repeat2 className="w-4 h-4" />
                  <span>
                    {post.repostCount ??
                      post.reposts ??
                      post._count?.reposts ??
                      0}
                  </span>
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleFavorite(postId, Boolean(post.isFavorited));
                  }}
                  disabled={favoritingPostIds.has(postId)}
                  aria-label={
                    post.isFavorited
                      ? "Remove post from favorites"
                      : "Save post"
                  }
                  title={
                    post.isFavorited ? "Remove from favorites" : "Save post"
                  }
                  className={`flex min-h-8 min-w-8 items-center justify-center rounded-lg px-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 disabled:opacity-50 ${
                    post.isFavorited
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-400"
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${post.isFavorited ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {loading && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <FeedSkeleton />
        </div>
      )}

      <ImageLightbox
        images={activeModal.images}
        currentIndex={activeModal.currentIndex}
        onClose={closeModal}
        onPrevious={prevImage}
        onNext={nextImage}
      />
    </div>
  );
}
