"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useLanguage } from "./language-provider";
import { supabaseBrowser } from "../lib/supabase-client";
import { Card, PageHeader, PageShell, PrimaryButton, StatusCard } from "./ui";

function nextPath(value: string | null) {
  return value?.startsWith("/") ? value : "/quick";
}

function emailLooksValid(value: string) {
  return /\S+@\S+\.\S+/.test(value);
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
        className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
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
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
        <Leaf aria-hidden="true" size={22} strokeWidth={1.8} />
      </div>
      <PageHeader compact eyebrow={t.auth.account} title={title}>
        {subtitle}
      </PageHeader>
      <Card variant="elevated" className="hover:translate-y-0">
        {children}
      </Card>
    </PageShell>
  );
}

export function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const next = nextPath(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace(next);
      }
    });
  }, [next, router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!emailLooksValid(email)) {
      setError(t.auth.validEmail);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.passwordLength);
      return;
    }

    setLoading(true);
    const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      setError(t.auth.loginFailed);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
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
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const next = nextPath(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!emailLooksValid(email)) {
      setError(t.auth.validEmail);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.passwordLength);
      return;
    }

    if (password !== confirm) {
      setError(t.auth.passwordsMismatch);
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message || t.feedback.error);
      return;
    }

    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    setMessage(t.auth.checkEmail);
  }

  return (
    <AuthShell title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle}>
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
        <PrimaryButton type="submit" disabled={loading} className="w-full">
          {loading ? t.auth.creatingAccount : t.auth.registerButton}
        </PrimaryButton>
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

  useEffect(() => {
    async function loadRecoverySession() {
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

    if (!emailLooksValid(email)) {
      setError(t.auth.validEmail);
      return;
    }

    setLoading(true);
    const { error: authError } =
      await supabaseBrowser.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    setLoading(false);

    if (authError) {
      setError(authError.message || t.feedback.error);
      return;
    }

    setMessage(t.auth.resetSent);
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError(t.auth.passwordLength);
      return;
    }

    if (password !== confirm) {
      setError(t.auth.passwordsMismatch);
      return;
    }

    setLoading(true);
    const { error: authError } = await supabaseBrowser.auth.updateUser({
      password,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message || t.feedback.error);
      return;
    }

    setMessage(t.auth.passwordUpdated);
  }

  return (
    <AuthShell title={t.auth.resetTitle} subtitle={t.auth.resetSubtitle}>
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
          <PrimaryButton type="submit" disabled={loading} className="w-full">
            {loading ? t.feedback.sending : t.auth.sendReset}
          </PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
