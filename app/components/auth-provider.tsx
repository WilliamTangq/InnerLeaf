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
  loading: boolean;
  signOut: () => Promise<void>;
};

type UserRole = "user" | "admin" | "tester";

type UserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile(nextSession: Session | null) {
      if (!nextSession?.user) {
        setProfile(null);
        return;
      }

      const { data } = await supabaseBrowser
        .from("profiles")
        .select("id, email, role")
        .eq("id", nextSession.user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      setProfile(
        data && ["user", "admin", "tester"].includes(data.role)
          ? (data as UserProfile)
          : {
              id: nextSession.user.id,
              email: nextSession.user.email ?? null,
              role: "user",
            }
      );
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
        loading,
        signOut: async () => {
          await supabaseBrowser.auth.signOut();
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
