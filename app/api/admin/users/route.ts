import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../../lib/auth-server";

function countByUser(rows: Array<{ user_id?: string | null }> | null) {
  const counts = new Map<string, number>();

  (rows ?? []).forEach((row) => {
    if (row.user_id) {
      counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
    }
  });

  return counts;
}

function latestByUser(rows: Array<{ user_id?: string | null; created_at?: string | null }> | null) {
  const latest = new Map<string, string>();

  (rows ?? []).forEach((row) => {
    if (!row.user_id || !row.created_at) {
      return;
    }

    const current = latest.get(row.user_id);

    if (!current || new Date(row.created_at) > new Date(current)) {
      latest.set(row.user_id, row.created_at);
    }
  });

  return latest;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin.isAdmin) {
      return NextResponse.json({ error: admin.error }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin data is unavailable right now." },
        { status: 500 }
      );
    }

    const [profilesResult, reflectionsResult, feedbackResult, authUsersResult] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, display_name, avatar_url, avatar_path, role, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("reflections").select("user_id, created_at"),
      supabaseAdmin.from("feedback").select("user_id, created_at"),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

    if (profilesResult.error) {
      console.error("Supabase admin profiles fetch error:", profilesResult.error);
      return NextResponse.json(
        { error: "Admin data is unavailable right now." },
        { status: 500 }
      );
    }

    if (reflectionsResult.error) {
      console.error(
        "Supabase admin reflection count fetch error:",
        reflectionsResult.error
      );
    }

    if (feedbackResult.error) {
      console.error("Supabase admin feedback count fetch error:", feedbackResult.error);
    }

    const reflectionCounts = countByUser(reflectionsResult.data);
    const feedbackCounts = countByUser(feedbackResult.data);
    const latestReflection = latestByUser(reflectionsResult.data);
    const latestFeedback = latestByUser(feedbackResult.data);
    const profilesById = new Map(
      (profilesResult.data ?? []).map((profile) => [profile.id, profile])
    );
    const authUsers = authUsersResult.error ? [] : authUsersResult.data.users;

    if (authUsersResult.error) {
      console.error("Supabase admin auth users fetch error:", authUsersResult.error);
    }

    const usersSource =
      authUsers.length > 0
        ? authUsers.map((authUser) => ({
            authUser,
            profile: profilesById.get(authUser.id) ?? null,
          }))
        : (profilesResult.data ?? []).map((profile) => ({
            authUser: null,
            profile,
          }));

    const users = usersSource.map(({ authUser, profile }) => ({
      id: authUser?.id ?? profile?.id,
      email: authUser?.email ?? profile?.email,
      display_name: profile?.display_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
      avatar_path: profile?.avatar_path ?? null,
      role: profile?.role ?? "user",
      created_at: authUser?.created_at ?? profile?.created_at,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
      reflection_count: reflectionCounts.get(authUser?.id ?? profile?.id ?? "") ?? 0,
      feedback_count: feedbackCounts.get(authUser?.id ?? profile?.id ?? "") ?? 0,
      last_reflection_at: latestReflection.get(authUser?.id ?? profile?.id ?? "") ?? null,
      last_feedback_at: latestFeedback.get(authUser?.id ?? profile?.id ?? "") ?? null,
    })).filter((user) => user.id);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { error: "Admin data is unavailable right now." },
      { status: 500 }
    );
  }
}
