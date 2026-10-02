import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import AuthShell from "../../components/auth/AuthShell";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) =>
    setFormData((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This password reset link is missing or invalid.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, formData.newPassword);
      navigate("/login", {
        replace: true,
        state: { message: "Your password has been reset. You can now sign in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not reset your password. The link may have expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="A fresh password, a fresh yap"
      description="Choose something memorable and keep your account safely yours."
    >
      <Link
        to="/login"
        className="mb-7 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#11133b]">
          Reset your password
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Create a new password to get back into your Yappa account.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!token ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
          This reset link is invalid or incomplete. Request a new one from the{" "}
          <Link to="/forgot-password" className="font-bold underline">
            forgot-password page
          </Link>
          .
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordInput
            label="New password"
            value={formData.newPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onChange={(value) => updateField("newPassword", value)}
          />

          <PasswordInput
            label="Confirm new password"
            value={formData.confirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onChange={(value) => updateField("confirmPassword", value)}
          />

          <ul className="space-y-1 text-xs font-bold text-slate-500">
            <PasswordRule
              valid={formData.newPassword.length >= 8}
              text="At least 8 characters"
            />
            <PasswordRule
              valid={/[a-zA-Z]/.test(formData.newPassword)}
              text="At least one letter"
            />
            <PasswordRule
              valid={/[0-9]/.test(formData.newPassword)}
              text="At least one number"
            />
            <PasswordRule
              valid={/[^a-zA-Z0-9]/.test(formData.newPassword)}
              text="At least one special character"
            />
          </ul>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {isSubmitting ? "Resetting password..." : "Reset password"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        Need a new reset link?{" "}
        <Link
          to="/forgot-password"
          className="font-bold text-indigo-600 hover:text-indigo-500"
        >
          Request one
        </Link>
      </p>
    </AuthShell>
  );
}

function PasswordInput({
  label,
  value,
  showPassword,
  setShowPassword,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </span>
      <span className="relative block">
        <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={showPassword ? "text" : "password"}
          required
          autoComplete="new-password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="At least 8 characters"
          className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3.5 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
          aria-label={`Toggle ${label.toLowerCase()} visibility`}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </span>
    </label>
  );
}

function PasswordRule({ valid, text }) {
  return <li className={valid ? "text-emerald-600" : ""}>{valid ? "✓" : "·"} {text}</li>;
}
