import { useState } from "react";
import { Camera, LoaderCircle, X } from "lucide-react";
import { changeBio, changeName, changeUsername } from "../api/user";

const fieldClass =
  "peer w-full rounded-md border border-neutral-300 bg-transparent px-3 pb-2 pt-6 text-[15px] outline-none transition focus:border-indigo-500 dark:border-neutral-700 dark:text-neutral-100";

export default function EditProfileModal({
  profile,
  onClose,
  onSaved,
  onAvatarChange,
  onBackgroundChange,
  isUploadingAvatar,
  isUploadingBackground,
}) {
  const [form, setForm] = useState(() => ({
    name: profile.name || "",
    username: profile.username || "",
    bio: profile.bio || "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const save = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const username = form.username.trim();
    const bio = form.bio.trim();

    if (!name || !username) {
      setError("Name and username are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updates = {};
      if (name !== profile.name) {
        const response = await changeName({ name });
        Object.assign(updates, response.data || {});
      }
      if (username !== profile.username) {
        const response = await changeUsername({ username });
        Object.assign(updates, response.data || {});
      }
      if (bio !== (profile.bio || "")) {
        await changeBio({ bio });
        updates.bio = bio;
      }

      onSaved({ ...updates, name, username, bio });
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Could not update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFile = (event, callback) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) callback({ target: { files: [file], value: "" } });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-neutral-950"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 px-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-2 text-neutral-700 hover:bg-black/5 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-white/10"
            aria-label="Close edit profile"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 id="edit-profile-title" className="text-lg font-bold">
            Edit profile
          </h2>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={saving}
            className="flex min-w-16 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {saving ? "Saving" : "Save"}
          </button>
        </header>

        <form
          id="edit-profile-form"
          onSubmit={save}
          className="overflow-y-auto"
        >
          <div className="relative h-36 bg-indigo-500 sm:h-44">
            {profile.bgUrl && (
              <img
                src={profile.bgUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <label
                className="cursor-pointer rounded-full bg-black/50 p-3 text-white backdrop-blur hover:bg-black/70"
                title="Change cover photo"
              >
                {isUploadingBackground ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={saving || isUploadingBackground}
                  onChange={(event) => handleFile(event, onBackgroundChange)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="relative px-5 pb-5">
            <div className="-mt-12 flex items-end justify-between">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-indigo-100 dark:border-neutral-950 dark:bg-indigo-950">
                {profile.imageUrl ? (
                  <img
                    src={profile.imageUrl}
                    alt={profile.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                    {(profile.name || profile.username || "P")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
                <label
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-white opacity-0 transition hover:opacity-100"
                  title="Change profile photo"
                >
                  {isUploadingAvatar ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={saving || isUploadingAvatar}
                    onChange={(event) => handleFile(event, onAvatarChange)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-5 pb-5">
            <label className="relative block">
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                maxLength={50}
                placeholder=" "
                className={fieldClass}
              />
              <span className="pointer-events-none absolute left-3 top-2 text-xs text-neutral-500 transition peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-500">
                Name
              </span>
            </label>

            <label className="relative block">
              <input
                name="username"
                value={form.username}
                onChange={updateField}
                maxLength={54}
                placeholder=" "
                className={fieldClass}
              />
              <span className="pointer-events-none absolute left-3 top-2 text-xs text-neutral-500 transition peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-500">
                Username
              </span>
            </label>

            <label className="relative block">
              <textarea
                name="bio"
                value={form.bio}
                onChange={updateField}
                maxLength={350}
                rows={4}
                placeholder=" "
                className={`${fieldClass} resize-none`}
              />
              <span className="pointer-events-none absolute left-3 top-2 text-xs text-neutral-500 transition peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-500">
                Bio
              </span>
              <span className="absolute bottom-2 right-3 text-xs text-neutral-400">
                {form.bio.length}/350
              </span>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
