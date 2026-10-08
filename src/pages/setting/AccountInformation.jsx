import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";
import { changeEmail, changePassword } from "../../api/user";
import { useAuth } from "../../hooks/useAuth";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const isValidPassword = (password) =>
  password.length >= 8 &&
  /[a-zA-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^a-zA-Z0-9]/.test(password);

export default function AccountInformation() {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (!emailPassword) {
      setEmailError("Enter your current password to confirm this change.");
      return;
    }
    if (nextEmail === user?.email?.toLowerCase()) {
      setEmailError("That is already your current email address.");
      return;
    }

    setIsEmailSubmitting(true);
    try {
      await changeEmail({ newEmail: nextEmail, password: emailPassword });
      updateUser({ email: nextEmail });
      setEmail(nextEmail);
      setEmailPassword("");
      setEmailSuccess("Your email address has been updated.");
    } catch (error) {
      setEmailError(
        getErrorMessage(error, "Could not update your email address."),
      );
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (!isValidPassword(newPassword)) {
      setPasswordError(
        "Your new password must be at least 8 characters and include a letter, number, and special character.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsPasswordSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Your password has been updated.");
    } catch (error) {
      setPasswordError(
        getErrorMessage(error, "Could not update your password."),
      );
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <section className="w-full">
      <header className="border-b border-black/10 px-4 py-5 dark:border-white/10 sm:px-6">
        <Link
          to="/setting"
          className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Account information
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your sign-in email and password.
        </p>
      </header>

      <div className="space-y-6 p-4 sm:p-6">
        <form
          onSubmit={handleEmailSubmit}
          className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-neutral-900/60 sm:p-5"
        >
          <div className="mb-4">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Email address
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Use your password to confirm the new email address.
            </p>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              New email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 dark:border-white/10"
                required
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Current password
              <input
                type="password"
                value={emailPassword}
                onChange={(event) => setEmailPassword(event.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 dark:border-white/10"
                required
              />
            </label>
          </div>
          {emailError && <p className="mt-3 text-sm text-red-500">{emailError}</p>}
          {emailSuccess && (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              {emailSuccess}
            </p>
          )}
          <button
            type="submit"
            disabled={isEmailSubmitting}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
          >
            {isEmailSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isEmailSubmitting ? "Updating..." : "Update email"}
          </button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-neutral-900/60 sm:p-5"
        >
          <div className="mb-4">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Password
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose a password you do not use on another account.
            </p>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 dark:border-white/10"
                required
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 dark:border-white/10"
                required
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 dark:border-white/10"
                required
              />
            </label>
          </div>
          {passwordError && (
            <p className="mt-3 text-sm text-red-500">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              {passwordSuccess}
            </p>
          )}
          <button
            type="submit"
            disabled={isPasswordSubmitting}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
          >
            {isPasswordSubmitting && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            {isPasswordSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </section>
  );
}
