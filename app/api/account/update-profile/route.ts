import { NextResponse } from "next/server";
import { requireAuth, supabaseAdmin } from "../../../lib/auth-server";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);

    if (!auth.user) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Please log in to continue." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const displayName = optionalText(body.display_name);
    const avatarUrl = optionalText(body.avatar_url);
    const avatarPath = optionalText(body.avatar_path);
    const isPrimaryAdmin = auth.user.email?.toLowerCase() === "admin@gmail.com";

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("profiles").upsert(
      {
        id: auth.user.id,
        email: auth.user.email ?? null,
        role: isPrimaryAdmin ? "admin" : existingProfile?.role ?? "user",
        display_name: displayName,
        avatar_url: avatarUrl,
        avatar_path: avatarPath,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase update profile error:", error);
      return NextResponse.json(
        { error: "Profile could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update profile API error:", error);
    return NextResponse.json(
      { error: "Profile could not be updated." },
      { status: 500 }
    );
  }
}
