import { useParams } from "react-router-dom";
import { getProfile, changeAvatar, changeBio } from "../api/user";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { Camera, PenLine, Check, X, CalendarDays } from "lucide-react";
import UserPost from "./UserPost";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

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

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!profile)
    return <div className="text-center py-10">Failed to load profile.</div>;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-black/10 bg-white/60 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="group relative w-28 h-28 shrink-0">
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
        </div>
        {isUploadingAvatar && (
          <p className="mt-2 text-xs text-indigo-500">Uploading image...</p>
        )}
        {avatarError && (
          <p className="mt-2 text-xs text-red-500">{avatarError}</p>
        )}
        <h1 className="text-xl font-bold text-neutral-900 mt-2 dark:text-neutral-100">
          {profile.name || "Profile"}
        </h1>
        {profile.username && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            @{profile.username}
          </p>
        )}

        {profile.createdAt && (
          <p className="flex items-center gap-2 text-s text-neutral-500 dark:text-neutral-400">
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

        <div className="mt-3">
          {isEditingBio ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={3}
                maxLength={255}
                autoFocus
                className="w-full resize-none rounded-xl border border-indigo-500/40 bg-transparent p-3 text-sm text-neutral-800 outline-none dark:text-neutral-200"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {bioText.length}/255
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
          ) : (
            isOwnProfile && (
              <button
                onClick={startEditingBio}
                className="flex items-center gap-2 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors py-1"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Add a bio</span>
              </button>
            )
          )}
        </div>
      </div>
      <UserPost userId={profile.id} />
    </div>
  );
}
