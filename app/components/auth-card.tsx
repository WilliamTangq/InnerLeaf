"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { useLanguage } from "./language-provider";
import { supabaseBrowser } from "../lib/supabase-client";
import { normalizeRole, resolveRoleAwareNextPath } from "../lib/routes";
import { trackEvent } from "../lib/analytics";
import {
  loginSchema,
  passwordUpdateSchema,
  registerSchema,
  resetEmailSchema,
} from "../lib/validation";
import { Card, PageHeader, PageShell, PrimaryButton, StatusCard } from "./ui";

function nextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

async function roleForCurrentSession() {
  if (!supabaseBrowser) {
    return "user";
  }

  const { data: sessionData } = await supabaseBrowser.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    return "user";
  }

  const response = await fetch("/api/account/profile", {
    headers: {
      Authorization: `Bearer ${sessionData.session?.access_token}`,
    },
  });

  if (!response.ok) {
    return "user";
  }

  const data = (await response.json()) as {
    profile?: { role?: string | null };
  };

  if (
    data.profile?.role === "admin" ||
    data.profile?.role === "tester" ||
    data.profile?.role === "user"
  ) {
    return data.profile.role;
  }

  return "user";
}

async function roleAwareRedirect(next: string | null): Promise<string> {
  return resolveRoleAwareNextPath(next, normalizeRole(await roleForCurrentSession()));
}

function isRateLimitError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const details = error as { message?: string; status?: number; code?: string };
  const text = `${details.message ?? ""} ${details.code ?? ""}`.toLowerCase();

  return (
    details.status === 429 ||
    text.includes("email rate limit exceeded") ||
    text.includes("rate_limit") ||
    text.includes("over_email_send_rate_limit")
  );
}

function authValidationMessage(
  field: PropertyKey | undefined,
  t: ReturnType<typeof useLanguage>["t"]
) {
  if (field === "email") {
    return t.auth.validEmail;
  }

  if (field === "confirm") {
    return t.auth.passwordsMismatch;
  }

  return t.auth.passwordLength;
}

function useCooldown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [seconds]);

  return [seconds, setSeconds] as const;
}

function AuthInput({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--foreground)]">
        {label}
      </span>
      <input
        className="mt-2 w-full rounded-[calc(var(--radius-lg)+4px)] border border-[var(--border)] bg-[rgba(255,254,248,0.92)] px-4 py-3 text-[15px] text-[var(--foreground)] shadow-[var(--shadow-sm)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
      />
    </label>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <PageShell maxWidth="max-w-md">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_20%_0%,rgba(31,155,143,0.14),transparent_34%),radial-gradient(circle_at_92%_10%,rgba(217,179,74,0.13),transparent_36%)] blur-3xl"
        />
        <Card
          variant="elevated"
          className="relative overflow-hidden p-6 shadow-[var(--shadow-xl)] hover:translate-y-0 sm:p-7"
        >
          <div
            className="-mx-6 -mt-6 mb-6 h-1 sm:-mx-7 sm:-mt-7"
            style={{ background: "var(--brand-gradient)" }}
            aria-hidden="true"
          />
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(31,155,143,0.14)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)] shadow-[var(--shadow-soft)]">
            <Leaf aria-hidden="true" size={22} strokeWidth={1.8} />
          </div>
          <PageHeader compact eyebrow={t.auth.account} title={title}>
            {subtitle}
          </PageHeader>
          {children}
        </Card>
      </div>
    </PageShell>
  );
}

export function LoginForm() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const next = nextPath(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const showDemoLogin = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === "true";
  const demoEmail = process.env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL;
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD;

  useEffect(() => {
    if (!supabaseBrowser) {
      return;
    }

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) {
        roleAwareRedirect(next).then((target) => router.replace(target));
      }
    });
  }, [next, router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    trackEvent("login_started", {
      locale: language,
      authenticated_state: false,
      role_bucket: "logged_out",
    });

    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      setError(authValidationMessage(parsed.error.issues[0]?.path[0], t));
      return;
    }

    setLoading(true);
    if (!supabaseBrowser) {
      setError(t.auth.supabaseUnavailable);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      setError(t.auth.loginFailed);
      return;
    }

    const nextRole = await roleForCurrentSession();
    trackEvent("login_completed", {
      locale: language,
      authenticated_state: true,
      role_bucket: nextRole,
    });
    toast.success(t.auth.loginButton, {
      description: t.auth.loginSubtitle,
    });
    router.push(resolveRoleAwareNextPath(next, normalizeRole(nextRole)));
    router.refresh();
  }

  return (
    <AuthShell title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      {!supabaseBrowser && (
        <StatusCard tone="error">{t.auth.authUnavailableTitle}</StatusCard>
      )}
      <form onSubmit={login} className="space-y-4">
        <AuthInput
          label={t.auth.email}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <AuthInput
          label={t.auth.password}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {error && <StatusCard tone="error">{error}</StatusCard>}
        <PrimaryButton type="submit" disabled={loading} className="w-full">
          {loading ? t.auth.loggingIn : t.auth.loginButton}
        </PrimaryButton>
      </form>
      <div className="mt-5 space-y-2 text-sm text-[var(--foreground-muted)]">
        {showDemoLogin && demoEmail && demoPassword && (
          <StatusCard tone="neutral">
            {t.auth.demoLoginHint}
            <br />
            {t.auth.demoLoginCredentials} {demoEmail} / {demoPassword}
          </StatusCard>
        )}
        <Link
          href="/reset-password"
          className="block font-medium text-[var(--brand-teal-deep)] hover:underline"
        >
          {t.auth.forgotPassword}
        </Link>
        <Link
          href="/register"
          className="block font-medium text-[var(--brand-teal-deep)] hover:underline"
        >
          {t.auth.registerLink}
        </Link>
      </div>
    </AuthShell>
  );
}

export function RegisterForm() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const next = nextPath(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useCooldown();

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    trackEvent("register_started", {
      locale: language,
      authenticated_state: false,
      role_bucket: "logged_out",
    });

    const parsed = registerSchema.safeParse({ email, password, confirm });

    if (!parsed.success) {
      setError(authValidationMessage(parsed.error.issues[0]?.path[0], t));
      return;
    }

    setLoading(true);
    if (!supabaseBrowser) {
      setError(t.auth.supabaseUnavailable);
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);

    if (authError) {
      if (isRateLimitError(authError)) {
        setError(`${t.auth.rateLimit} ${t.auth.waitBeforeRetry}`);
        setCooldown(60);
      } else {
        setError(authError.message || t.feedback.error);
      }
      return;
    }

    if (data.session) {
      const nextRole = await roleForCurrentSession();
      trackEvent("register_completed", {
        locale: language,
        authenticated_state: true,
        role_bucket: nextRole,
        email_confirmation_required: false,
      });
      toast.success(t.auth.registerButton, {
        description: t.auth.registerSubtitle,
      });
      router.push(resolveRoleAwareNextPath(next, normalizeRole(nextRole)));
      router.refresh();
      return;
    }

    trackEvent("register_completed", {
      locale: language,
      authenticated_state: false,
      role_bucket: "logged_out",
      email_confirmation_required: true,
    });
    setMessage(t.auth.checkEmail);
    toast.success(t.auth.checkEmail);
  }

  return (
    <AuthShell title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle}>
      {!supabaseBrowser && (
        <StatusCard tone="error">{t.auth.authUnavailableTitle}</StatusCard>
      )}
      <form onSubmit={register} className="space-y-4">
        <AuthInput
          label={t.auth.email}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <AuthInput
          label={t.auth.password}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <AuthInput
          label={t.auth.confirmPassword}
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {error && <StatusCard tone="error">{error}</StatusCard>}
        {message && <StatusCard tone="success">{message}</StatusCard>}
        <StatusCard tone="neutral">{t.auth.mvpRegisterNote}</StatusCard>
        <PrimaryButton
          type="submit"
          disabled={loading || cooldown > 0}
          className="w-full"
        >
          {loading ? t.auth.creatingAccount : t.auth.registerButton}
        </PrimaryButton>
        {cooldown > 0 && (
          <p className="text-sm text-[var(--foreground-subtle)]">
            {t.auth.waitBeforeRetry} ({cooldown}s)
          </p>
        )}
      </form>
      <Link
        href="/login"
        className="mt-5 block text-sm font-medium text-[var(--brand-teal-deep)] hover:underline"
      >
        {t.auth.loginLink}
      </Link>
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [cooldown, setCooldown] = useCooldown();

  useEffect(() => {
    async function loadRecoverySession() {
      if (!supabaseBrowser) {
        setRecovery(false);
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        await supabaseBrowser.auth.exchangeCodeForSession(code);
        window.history.replaceState(null, "", window.location.pathname);
      }

      const { data } = await supabaseBrowser.auth.getSession();
      setRecovery(Boolean(data.session));
    }

    void loadRecoverySession();
  }, []);

  async function sendReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const parsed = resetEmailSchema.safeParse({ email });

    if (!parsed.success) {
      setError(t.auth.validEmail);
      return;
    }

    setLoading(true);
    if (!supabaseBrowser) {
      setError(t.auth.supabaseUnavailable);
      setLoading(false);
      return;
    }

    const { error: authError } =
      await supabaseBrowser.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    setLoading(false);

    if (authError) {
      if (isRateLimitError(authError)) {
        setError(`${t.auth.rateLimit} ${t.auth.waitBeforeRetry}`);
        setCooldown(60);
      } else {
        setError(authError.message || t.feedback.error);
      }
      return;
    }

    setMessage(t.auth.resetSent);
    toast.success(t.auth.resetSent);
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const parsed = passwordUpdateSchema.safeParse({ password, confirm });

    if (!parsed.success) {
      setError(authValidationMessage(parsed.error.issues[0]?.path[0], t));
      return;
    }

    setLoading(true);
    if (!supabaseBrowser) {
      setError(t.auth.supabaseUnavailable);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabaseBrowser.auth.updateUser({
      password,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message || t.feedback.error);
      return;
    }

    setMessage(t.auth.passwordUpdated);
    toast.success(t.auth.passwordUpdated);
  }

  return (
    <AuthShell title={t.auth.resetTitle} subtitle={t.auth.resetSubtitle}>
      {!supabaseBrowser && (
        <StatusCard tone="error">{t.auth.authUnavailableTitle}</StatusCard>
      )}
      {recovery ? (
        <form onSubmit={updatePassword} className="space-y-4">
          <AuthInput
            label={t.auth.newPassword}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <AuthInput
            label={t.auth.confirmPassword}
            type="password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
          {error && <StatusCard tone="error">{error}</StatusCard>}
          {message && <StatusCard tone="success">{message}</StatusCard>}
          <PrimaryButton type="submit" disabled={loading} className="w-full">
            {loading ? t.feedback.sending : t.auth.updatePassword}
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={sendReset} className="space-y-4">
          <AuthInput
            label={t.auth.email}
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          {error && <StatusCard tone="error">{error}</StatusCard>}
          {message && <StatusCard tone="success">{message}</StatusCard>}
          <PrimaryButton
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full"
          >
            {loading ? t.feedback.sending : t.auth.sendReset}
          </PrimaryButton>
          {cooldown > 0 && (
            <p className="text-sm text-[var(--foreground-subtle)]">
              {t.auth.waitBeforeRetry} ({cooldown}s)
            </p>
          )}
        </form>
      )}
    </AuthShell>
  );
}
