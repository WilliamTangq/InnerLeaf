import { NextResponse } from "next/server";
import { getAdminFromRequest, supabaseAdmin } from "../../../lib/auth-server";

function countByUser(rows: Array<{ user_id?: string | null }> | null) {
  const counts = new Map<string, number>();

  (rows ?? []).forEach((row) => {
    if (row.user_id) {
      counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
    }
  });

  return counts;
}

export async function GET(request: Request) {
  try {
    const { isAdmin } = await getAdminFromRequest(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin data is unavailable right now." },
        { status: 500 }
      );
    }

    const [profilesResult, reflectionsResult, feedbackResult] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, display_name, avatar_url, avatar_path, role, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("reflections").select("user_id"),
      supabaseAdmin.from("feedback").select("user_id"),
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

    const users = (profilesResult.data ?? []).map((profile) => ({
      id: profile.id,
      email: profile.email,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      avatar_path: profile.avatar_path,
      role: profile.role,
      created_at: profile.created_at,
      reflection_count: reflectionCounts.get(profile.id) ?? 0,
      feedback_count: feedbackCounts.get(profile.id) ?? 0,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { error: "Admin data is unavailable right now." },
      { status: 500 }
    );
  }
}
