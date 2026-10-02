import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../api/auth";
import AuthShell from "../../components/auth/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(
        response.data?.message ||
          "If an account exists for that email, we sent a reset link.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not send a reset link. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Let’s get you back to your yaps"
      description="A quick reset and you’ll be back to sharing your very important thoughts."
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
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#11133b]">
          Forgot your password?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter your email and we’ll send you a secure link to create a new
          password.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
          <div className="mb-2 flex items-center gap-2 font-bold">
            <Check className="h-4 w-4" />
            Check your inbox
          </div>
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-700">
              Email
            </span>
            <span className="relative block">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {isSubmitting ? "Sending link..." : "Send reset link"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        Remembered your password?{" "}
        <Link
          to="/login"
          className="font-bold text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
