"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabaseBrowser } from "../lib/supabase-client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isTester: boolean;
  authUnavailable: boolean;
  authLoading: boolean;
  profileLoading: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

type UserRole = "user" | "admin" | "tester";

type UserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(nextSession: Session | null) {
  if (!nextSession?.user) {
    return null;
  }

  if (!supabaseBrowser) {
    return null;
  }

  const { data } = await supabaseBrowser
    .from("profiles")
    .select("id, email, role, display_name, avatar_url, avatar_path, created_at, updated_at")
    .eq("id", nextSession.user.id)
    .maybeSingle();

  if (data && ["user", "admin", "tester"].includes(data.role)) {
    if (process.env.NODE_ENV !== "production") {
      console.info("InnerLeaf profile role fetched", {
        userId: nextSession.user.id,
        email: nextSession.user.email,
        role: data.role,
      });
    }

    return data as UserProfile;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    nextSession.user.email?.toLowerCase() === "admin@gmail.com"
  ) {
    console.warn(
      "InnerLeaf admin profile is missing or not marked admin. Run: update public.profiles set role = 'admin' where lower(email) = 'admin@gmail.com';"
    );
  }

  return null;
}

async function ensureProfile(nextSession: Session | null) {
  if (!nextSession?.access_token || !nextSession.user) {
    return;
  }

  try {
    await fetch("/api/account/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${nextSession.access_token}`,
      },
      body: JSON.stringify({
        display_name:
          nextSession.user.email?.split("@")[0] || "InnerLeaf user",
        avatar_url: null,
        avatar_path: null,
      }),
    });
  } catch (error) {
    console.error("InnerLeaf profile ensure error:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(Boolean(supabaseBrowser));
  const [loading, setLoading] = useState(Boolean(supabaseBrowser));

  useEffect(() => {
    let mounted = true;

    if (!supabaseBrowser) {
      return () => {
        mounted = false;
      };
    }

    async function loadProfile(nextSession: Session | null) {
      let nextProfile = await fetchProfile(nextSession);

      if (!nextProfile && nextSession?.user) {
        await ensureProfile(nextSession);
        nextProfile = await fetchProfile(nextSession);
      }

      if (!mounted) {
        return;
      }

      setProfile(nextProfile);
    }

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setProfileLoading(Boolean(data.session));
      loadProfile(data.session).finally(() => {
        if (mounted) {
          setProfileLoading(false);
          setLoading(false);
        }
      });
    });

    const { data } = supabaseBrowser.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(true);
      setProfileLoading(Boolean(next));
      loadProfile(next).finally(() => {
        if (mounted) {
          setProfileLoading(false);
          setLoading(false);
        }
      });
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => {
      const role = profile?.role ?? null;

      return {
        user: session?.user ?? null,
        session,
        profile,
        role,
        isAdmin: role === "admin",
        isTester: role === "tester",
        authUnavailable: !supabaseBrowser,
        authLoading: loading,
        profileLoading,
        loading,
        refreshProfile: async () => {
          setProfileLoading(true);
          setProfile(await fetchProfile(session));
          setProfileLoading(false);
        },
        signOut: async () => {
          await supabaseBrowser?.auth.signOut();
          setSession(null);
          setProfile(null);
        },
      };
    },
    [loading, profile, profileLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
