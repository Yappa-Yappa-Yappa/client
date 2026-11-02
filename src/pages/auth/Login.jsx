import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ScanFace,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginWithFace, loginWithGoogle, requestOtp } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import AuthShell from "../../components/auth/AuthShell";
import SlowRequestNotice from "../../components/auth/SlowRequestNotice";
import FaceFrameModal from "../../components/FaceFrameModal";
import { useTheme } from "../../contexts/ThemeContext";
import { faceClientUrl } from "../../utils/face";
import { showSuccessToast } from "../../utils/toast";

export default function Login() {
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [hasCredentialError, setHasCredentialError] = useState(false);
  const [canVerifyAccount, setCanVerifyAccount] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isFaceSubmitting, setIsFaceSubmitting] = useState(false);
  const [faceSrc, setFaceSrc] = useState("");
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setSession } = useAuth();
  const { theme } = useTheme();

  const handleGoogleCredential = useCallback(
    async (response) => {
      setError("");
      setCanVerifyAccount(false);
      setIsGoogleSubmitting(true);

      try {
        const result = await loginWithGoogle(response.credential);
        setSession(result.data);
        navigate("/", { replace: true });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Google could not sign you in. Please try again.",
        );
      } finally {
        setIsGoogleSubmitting(false);
      }
    },
    [navigate, setSession],
  );

  const openFaceLogin = () => {
    setError("");
    const url = new URL("/face-login", faceClientUrl);
    url.searchParams.set("redirect", `${window.location.origin}/login`);
    url.searchParams.set("embed", "1");
    url.searchParams.set("theme", theme);
    setFaceSrc(url.toString());
  };

  const handleFaceMessage = useCallback(
    async (data) => {
      if (data?.type !== "face-login" || !data.code) return;
      setFaceSrc("");
      setIsFaceSubmitting(true);
      try {
        const result = await loginWithFace(data.code);
        setSession(result.data);
        showSuccessToast("Signed in with Face ID");
        navigate("/", { replace: true });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Face login failed. Please try again.",
        );
        setIsFaceSubmitting(false);
      }
    },
    [navigate, setSession],
  );

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    const renderGoogleButton = () => {
      if (!clientId || !window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "icon",
        theme: "filled_blue",
        size: "large",
        shape: "circle",

        // Pill type (ugly af lmfao)
        // theme: "outline",
        // size: "large",
        // shape: "pill",
        // width: 360,
      });
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      script?.addEventListener("load", renderGoogleButton, { once: true });
    }

    return () => script?.removeEventListener("load", renderGoogleButton);
  }, [handleGoogleCredential]);

  const handleVerifyAccount = async () => {
    setError("");
    setIsRequestingVerification(true);
    try {
      await requestOtp(formData.email);
      navigate("/register", { state: { verifyEmail: formData.email } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not send a verification code.",
      );
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setHasCredentialError(false);
    setCanVerifyAccount(false);
    setIsSubmitting(true);
    try {
      await login(formData);
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to sign in. Please try again.";
      setCanVerifyAccount(
        message.toLowerCase().includes("verify your account"),
      );
      const isCredentialError = message.toLowerCase() === "invalid credentials";
      setHasCredentialError(isCredentialError);
      setError(isCredentialError ? "" : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="The yaps missed you"
      description="Your account is still here, waiting patiently like a tab you forgot to close."
    >
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold text-[var(--accent-primary)]">
          Good to see you
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Join the conversation in a few seconds.
        </p>
      </div>
      {location.state?.message && (
        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-300">
          {location.state.message}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
          {error}
          {canVerifyAccount && (
            <button
              type="button"
              onClick={handleVerifyAccount}
              disabled={isRequestingVerification}
              className="ml-1 font-bold underline underline-offset-2 hover:text-red-800"
            >
              {isRequestingVerification
                ? "Sending code..."
                : "Verify your account"}
            </button>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
            Email
          </span>
          <span className="relative block">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(event) => {
                setHasCredentialError(false);
                setFormData({ ...formData, email: event.target.value });
              }}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)] px-11 py-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
            Password
          </span>
          <span className="relative block">
            <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(event) => {
                setHasCredentialError(false);
                setFormData({ ...formData, password: event.target.value });
              }}
              placeholder="Enter your password"
              className={`w-full rounded-xl border bg-[var(--bg-surface)] px-11 py-3.5 pr-12 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 ${hasCredentialError ? "border-red-500 focus:border-red-500" : "border-[var(--border-glass)] focus:border-[var(--accent-primary)]"}`}
              aria-invalid={hasCredentialError}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </span>
        </label>

        <div className="flex items-center justify-between gap-3">
          {hasCredentialError ? (
            <span className="text-xs font-medium text-red-500 dark:text-red-300">
              Invalid email or password.
            </span>
          ) : (
            <span />
          )}
          <Link
            to="/forgot-password"
            className="text-center text-sm font-bold text-[var(--accent-primary)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>
        {isSubmitting && <SlowRequestNotice />}
      </form>
      {faceClientUrl && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <span className="h-px flex-1 bg-[var(--border-glass)]" />
            <span>or</span>
            <span className="h-px flex-1 bg-[var(--border-glass)]" />
          </div>
          <button
            type="button"
            onClick={openFaceLogin}
            disabled={isFaceSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)] py-3.5 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:opacity-60"
          >
            {isFaceSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ScanFace className="h-4 w-4" />
            )}
            Log in with Face ID
          </button>
        </>
      )}
      {hasGoogleClientId && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <span className="h-px flex-1 bg-[var(--border-glass)]" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-[var(--border-glass)]" />
          </div>
          <div className="relative flex min-h-10 justify-center">
            <div ref={googleButtonRef} aria-label="Continue with Google" />
            {isGoogleSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--bg-surface)]/80 text-sm font-semibold text-[var(--text-secondary)]">
                <LoaderCircle className="animate-spin" />
              </div>
            )}
          </div>
        </>
      )}

      <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-bold text-[var(--accent-primary)] hover:text-[var(--accent-hover)]"
        >
          Register
        </Link>
      </p>
      {faceSrc && (
        <FaceFrameModal
          title="Log in with Face ID"
          src={faceSrc}
          onMessage={handleFaceMessage}
          onClose={() => setFaceSrc("")}
        />
      )}
    </AuthShell>
  );
}
