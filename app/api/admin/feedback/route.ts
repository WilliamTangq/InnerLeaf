import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../../lib/auth-server";

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

    const [feedbackResult, profilesResult] = await Promise.all([
      supabaseAdmin
        .from("feedback")
        .select(
          "id, created_at, user_id, mode_tried, ease_of_start, reflection_length, clarity_help, would_use_again, alternative_tool, saving_blocker, comparison_feedback, blocker, other_thoughts"
        )
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin.from("profiles").select("id, email"),
    ]);

    if (feedbackResult.error) {
      console.error("Supabase admin feedback fetch error:", feedbackResult.error);
      return NextResponse.json(
        { error: "Admin data is unavailable right now." },
        { status: 500 }
      );
    }

    if (profilesResult.error) {
      console.error("Supabase admin feedback profiles fetch error:", profilesResult.error);
    }

    const emailById = new Map(
      (profilesResult.data ?? []).map((profile) => [profile.id, profile.email])
    );

    const feedback = (feedbackResult.data ?? []).map((item) => ({
      ...item,
      email: item.user_id ? emailById.get(item.user_id) ?? null : null,
    }));

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Admin feedback API error:", error);
    return NextResponse.json(
      { error: "Admin data is unavailable right now." },
      { status: 500 }
    );
  }
}
