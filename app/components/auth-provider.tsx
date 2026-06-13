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
  role: UserRole;
  isAdmin: boolean;
  authUnavailable: boolean;
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
    .select("id, email, role, display_name, avatar_url, avatar_path, created_at")
    .eq("id", nextSession.user.id)
    .maybeSingle();

  if (data && ["user", "admin", "tester"].includes(data.role)) {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(supabaseBrowser));

  useEffect(() => {
    let mounted = true;

    if (!supabaseBrowser) {
      return () => {
        mounted = false;
      };
    }

    async function loadProfile(nextSession: Session | null) {
      const nextProfile = await fetchProfile(nextSession);

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
      loadProfile(data.session).finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    });

    const { data } = supabaseBrowser.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(true);
      loadProfile(next).finally(() => {
        if (mounted) {
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
      const role = profile?.role ?? "user";

      return {
        user: session?.user ?? null,
        session,
        profile,
        role,
        isAdmin: role === "admin",
        authUnavailable: !supabaseBrowser,
        loading,
        refreshProfile: async () => {
          setProfile(await fetchProfile(session));
        },
        signOut: async () => {
          await supabaseBrowser?.auth.signOut();
          setSession(null);
          setProfile(null);
        },
      };
    },
    [loading, profile, session]
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
