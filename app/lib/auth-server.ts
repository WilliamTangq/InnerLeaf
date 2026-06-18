import { createClient, type User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export async function getUserFromRequest(request: Request): Promise<User | null> {
  if (!supabaseAdmin) {
    return null;
  }

  const header = request.headers.get("authorization");
  const token = header?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    console.error("Supabase auth verification error:", error);
    return null;
  }

  return data.user ?? null;
}

export type ServerUserRole = "user" | "admin" | "tester";
type ServerProfile = {
  id: string;
  email: string | null;
  role: ServerUserRole;
  created_at: string | null;
};
type AdminCheckResult =
  | {
      user: User;
      profile: ServerProfile | null;
      isAdmin: true;
      error: null;
    }
  | {
      user: User | null;
      profile: ServerProfile | null;
      isAdmin: false;
      error: string;
      status: 401 | 403;
    };

type AuthCheckResult =
  | {
      user: User;
      error: null;
      status?: never;
    }
  | {
      user: null;
      error: string;
      status: 401;
    };

export async function getProfileForUser(userId: string) {
  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase profile fetch error:", error);
    return null;
  }

  return data as ServerProfile | null;
}

export async function requireAuth(request: Request): Promise<AuthCheckResult> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return {
      user: null,
      error: "Please log in to continue.",
      status: 401,
    };
  }

  return { user, error: null };
}

export async function getAdminFromRequest(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return { user: null, profile: null, isAdmin: false };
  }

  const profile = await getProfileForUser(user.id);

  return {
    user,
    profile,
    isAdmin: profile?.role === "admin",
  };
}

export async function requireAdmin(request: Request): Promise<AdminCheckResult> {
  const { user, profile, isAdmin } = await getAdminFromRequest(request);

  if (!user) {
    return {
      user,
      profile,
      isAdmin: false,
      error: "Please log in to continue.",
      status: 401,
    };
  }

  if (!isAdmin) {
    return {
      user,
      profile,
      isAdmin: false,
      error: "Admin access required.",
      status: 403,
    };
  }

  return { user, profile, isAdmin: true, error: null };
}
