import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getProfile,
  changeAvatar,
  changeBackground,
  changeBio,
} from "../api/user";
import { followUser, unfollowUser } from "../api/follow";
import { openDirectConversation } from "../api/conversation";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import {
  Camera,
  PenLine,
  Check,
  X,
  CalendarDays,
  LoaderCircle,
  Minus,
  Plus,
} from "lucide-react";
import UserPost from "./UserPost";
import ProfileSkeleton from "../components/ProfileSkeleton";

const createCroppedImage = (imageSrc, pixelCrop) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      const context = canvas.getContext("2d");
      context.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not prepare the cropped image."));
            return;
          }
          resolve(
            new File([blob], "profile-cover.jpg", { type: "image/jpeg" }),
          );
        },
        "image/jpeg",
        0.9,
      );
    };
    image.onerror = () =>
      reject(new Error("Could not load the selected image."));
    image.src = imageSrc;
  });

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [backgroundError, setBackgroundError] = useState("");
  const [coverCropImage, setCoverCropImage] = useState("");
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [coverZoom, setCoverZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetUsername = username || currentUser?.username;
        const res = await getProfile(targetUsername);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, currentUser?.username]);

  const isOwnProfile = profile?.id === currentUser?.id;

  const startEditingBio = () => {
    setBioText(profile.bio || "");
    setIsEditingBio(true);
  };

  const cancelEditingBio = () => {
    setIsEditingBio(false);
    setBioText("");
  };

  const saveBio = async () => {
    try {
      const res = await changeBio({ bio: bioText });
      setProfile((prev) => ({ ...prev, bio: res.data.bio || bioText }));
      setIsEditingBio(false);
    } catch (err) {
      console.error("Failed to update bio:", err);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }

    setAvatarError("");
    setIsUploadingAvatar(true);

    try {
      const res = await changeAvatar(file);
      const imageUrl = res.data?.result?.imageUrl;
      if (imageUrl) {
        setProfile((prev) => ({ ...prev, imageUrl }));
      }
    } catch (err) {
      console.error("Failed to update avatar:", err);
      setAvatarError("Could not update your profile image. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBackgroundChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setBackgroundError("Please choose an image file.");
      return;
    }

    setBackgroundError("");
    setCoverCropImage(URL.createObjectURL(file));
    setCoverCrop({ x: 0, y: 0 });
    setCoverZoom(1);
    setCroppedAreaPixels(null);
  };

  const closeCoverCrop = (force = false) => {
    if (isUploadingBackground && !force) return;

    if (coverCropImage) URL.revokeObjectURL(coverCropImage);
    setCoverCropImage("");
    setCroppedAreaPixels(null);
  };

  const applyCoverCrop = async () => {
    if (!coverCropImage || !croppedAreaPixels) return;

    setIsUploadingBackground(true);

    try {
      const croppedFile = await createCroppedImage(
        coverCropImage,
        croppedAreaPixels,
      );
      const res = await changeBackground(croppedFile);
      const bgUrl = res.data?.result?.bgUrl;
      if (bgUrl) {
        setProfile((prev) => ({ ...prev, bgUrl }));
      }
      closeCoverCrop(true);
    } catch (err) {
      console.error("Failed to update profile cover:", err);
      setBackgroundError(
        "Could not update your profile cover. Please try again.",
      );
    } finally {
      setIsUploadingBackground(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile || isFollowLoading) return;

    setIsFollowLoading(true);
    const wasFollowing = profile.isFollowing;

    try {
      if (wasFollowing) await unfollowUser(profile.id);
      else await followUser(profile.id);

      setProfile((prev) => ({
        ...prev,
        isFollowing: !wasFollowing,
        _count: {
          ...prev._count,
          followings: Math.max(
            0,
            (prev._count?.followings || 0) + (wasFollowing ? -1 : 1),
          ),
        },
      }));
    } catch (err) {
      console.error("Failed to update follow state:", err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const openMessage = async () => {
    if (!profile || isMessageLoading) return;
    setIsMessageLoading(true);
    try {
      const response = await openDirectConversation(profile.id);
      navigate("/chat", { state: { conversationId: response.data.id } });
    } catch (err) {
      console.error("Failed to open conversation:", err);
    } finally {
      setIsMessageLoading(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile)
    return <div className="text-center py-10">Failed to load profile.</div>;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="group relative h-36 overflow-hidden bg-indigo-500 sm:h-44">
          {profile.bgUrl && (
            <img
              src={profile.bgUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {isUploadingBackground && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
              <LoaderCircle
                className="h-8 w-8 animate-spin"
                aria-label="Uploading cover"
              />
            </div>
          )}
          {isOwnProfile && (
            <label
              htmlFor="profile-background-upload"
              className={`absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-black/30 text-white opacity-0 shadow-md backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-black/50 ${isUploadingBackground ? "pointer-events-none opacity-60" : ""}`}
              title="Change profile cover"
            >
              <Camera className="h-4 w-4" />
              <input
                id="profile-background-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBackgroundChange}
                disabled={isUploadingBackground}
                className="sr-only"
              />
            </label>
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="group relative -mt-14 w-28 h-28 shrink-0">
            <div className="w-full h-full bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden ring-4 ring-white/70 dark:ring-neutral-800">
              {profile.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt={profile.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                  {(profile.name || profile.username || "P")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>
            {isOwnProfile && (
              <label
                htmlFor="profile-image-upload"
                className={`absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-indigo-500 dark:border-neutral-900 ${isUploadingAvatar ? "pointer-events-none opacity-60" : ""}`}
                title="Change profile image"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                  className="sr-only"
                />
              </label>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 text-white">
                <LoaderCircle
                  className="h-7 w-7 animate-spin"
                  aria-label="Uploading profile image"
                />
              </div>
            )}
          </div>
        </div>
        {avatarError && (
          <p className="px-6 text-xs text-red-500">{avatarError}</p>
        )}
        {backgroundError && (
          <p className="px-6 text-xs text-red-500">{backgroundError}</p>
        )}
        <div className="flex items-center justify-between px-6">
          <h1 className="text-xl font-bold text-neutral-900 mt-2 dark:text-neutral-100">
            {profile.name || "Profile"}
          </h1>

          {isOwnProfile ? (
            <button className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-full transition-colors shadow-sm">
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={openMessage}
                disabled={isMessageLoading}
                className="rounded-full border border-indigo-500/30 px-4 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/10 disabled:cursor-wait disabled:opacity-60 dark:text-indigo-300"
              >
                {isMessageLoading ? "Opening..." : "Message"}
              </button>
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${
                  profile.isFollowing
                    ? "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                    : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                }`}
              >
                {isFollowLoading
                  ? "Updating..."
                  : profile.isFollowing
                    ? "Following"
                    : "Follow"}
              </button>
            </div>
          )}
        </div>
        {profile.username && (
          <p className="px-6 text-sm text-neutral-500 dark:text-neutral-400">
            @{profile.username}
          </p>
        )}
        {profile.createdAt && (
          <p className="flex items-center gap-2 px-6 py-1 text-xs text-neutral-500 dark:text-neutral-400">
            <CalendarDays className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <span>
              Joined{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        )}
        <div className="flex items-center justify-start space-x-4 px-6">
          <p>
            {profile._count?.followings ?? 0}{" "}
            <Link
              to={`/friend/${username}/following`}
              className="hover:underline text-neutral-400 text-xs dark:text-neutral-500"
            >
              Followers
            </Link>
          </p>
          <p>
            {profile._count?.followers ?? 0}{" "}
            <Link
              to={`/friend/${username}/followers`}
              className="hover:underline text-neutral-400 text-xs dark:text-neutral-500"
            >
              Following
            </Link>
          </p>
        </div>{" "}
        <div className="my-3 px-6">
          {isEditingBio ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={3}
                maxLength={350}
                autoFocus
                className="w-full resize-none rounded-xl border border-indigo-500/40 bg-transparent p-3 text-sm text-neutral-800 outline-none dark:text-neutral-200"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {bioText.length}/350
                </span>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEditingBio}
                    className="p-1.5 rounded-lg text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={saveBio}
                    className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-500/10"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : profile.bio ? (
            <div className="group relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 text-sm border border-black/5 dark:border-neutral-800 transition-colors">
              <p className="leading-relaxed">{profile.bio}</p>
              {isOwnProfile && (
                <button
                  onClick={startEditingBio}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all shrink-0"
                  title="Edit bio"
                >
                  <PenLine className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : isOwnProfile ? (
            <button
              onClick={startEditingBio}
              className="flex items-center gap-2 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors py-1"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Add a bio</span>
            </button>
          ) : (
            <p className="text-sm italic text-neutral-400 dark:text-neutral-500">
              This user has no bio yet...
            </p>
          )}
        </div>
      </div>

      {coverCropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cover-crop-title"
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-neutral-800">
              <div>
                <h2
                  id="cover-crop-title"
                  className="font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  Adjust your cover photo
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Drag to reposition and zoom to choose the visible area.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCoverCrop}
                disabled={isUploadingBackground}
                className="rounded-lg p-2 text-neutral-400 hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
                aria-label="Close cover crop editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative h-64 w-full bg-neutral-950 sm:h-80">
              <Cropper
                image={coverCropImage}
                crop={coverCrop}
                zoom={coverZoom}
                aspect={3 / 1}
                onCropChange={setCoverCrop}
                onZoomChange={setCoverZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                showGrid={false}
              />
            </div>

            <div className="flex items-center gap-3 px-5 pt-4">
              <Minus className="h-4 w-4 text-neutral-400" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={coverZoom}
                onChange={(event) => setCoverZoom(Number(event.target.value))}
                className="w-full accent-indigo-600"
                aria-label="Cover photo zoom"
              />
              <Plus className="h-4 w-4 text-neutral-400" />
            </div>

            <div className="flex justify-end gap-3 px-5 py-4">
              <button
                type="button"
                onClick={closeCoverCrop}
                disabled={isUploadingBackground}
                className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-black/5 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCoverCrop}
                disabled={isUploadingBackground || !croppedAreaPixels}
                className="flex min-w-24 items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
              >
                {isUploadingBackground && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                {isUploadingBackground ? "Saving..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
      <UserPost userId={profile.id} />
    </div>
  );
}
