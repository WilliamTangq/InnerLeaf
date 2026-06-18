import { NextResponse } from "next/server";
import { requireAuth, supabaseAdmin } from "../../lib/auth-server";

const followUpResults = new Set(["Helped", "Somewhat", "Did not help"]);

function cleanOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);

    if (!auth.user) {
      return NextResponse.json(
        { error: "Could not save check-in. Please try again." },
        { status: auth.status }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Could not save check-in. Please try again." },
        { status: 500 }
      );
    }

    const { id, follow_up_result, follow_up_note } = await request.json();

    if (
      (typeof id !== "string" && typeof id !== "number") ||
      typeof follow_up_result !== "string" ||
      !followUpResults.has(follow_up_result)
    ) {
      return NextResponse.json(
        { error: "Could not save check-in. Please try again." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("reflections")
      .update({
        follow_up_result,
        follow_up_note: cleanOptionalText(follow_up_note),
        follow_up_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", auth.user.id);

    if (error) {
      console.error("Supabase check-in update error:", error);
      return NextResponse.json(
        { error: "Could not save check-in. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Check-in API error:", error);

    return NextResponse.json(
      { error: "Could not save check-in. Please try again." },
      { status: 500 }
    );
  }
}
