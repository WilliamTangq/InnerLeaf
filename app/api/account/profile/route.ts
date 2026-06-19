import { NextResponse } from "next/server";
import { requireAuth, supabaseAdmin } from "../../../lib/auth-server";

const roles = new Set(["user", "tester", "admin"]);
const protectedAdminEmail = "admin@gmail.com";

export async function GET(request: Request) {
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
        { error: "Profile is unavailable right now." },
        { status: 500 }
      );
    }

    const email = auth.user.email ?? null;
    const isPrimaryAdmin = email?.toLowerCase() === protectedAdminEmail;
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, display_name, avatar_url, avatar_path, created_at, updated_at")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Account profile fetch error:", fetchError);
      return NextResponse.json(
        { error: "Profile is unavailable right now." },
        { status: 500 }
      );
    }

    const nextRole = isPrimaryAdmin
      ? "admin"
      : roles.has(existingProfile?.role)
        ? existingProfile?.role
        : "user";

    if (!existingProfile || existingProfile.role !== nextRole || existingProfile.email !== email) {
      const { error: upsertError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: auth.user.id,
            email,
            role: nextRole,
            display_name:
              existingProfile?.display_name ??
              email?.split("@")[0] ??
              "InnerLeaf user",
            avatar_url: existingProfile?.avatar_url ?? null,
            avatar_path: existingProfile?.avatar_path ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        console.error("Account profile repair error:", upsertError);
        return NextResponse.json(
          { error: "Profile is unavailable right now." },
          { status: 500 }
        );
      }
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, display_name, avatar_url, avatar_path, created_at, updated_at")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (error || !profile) {
      console.error("Account profile reload error:", error);
      return NextResponse.json(
        { error: "Profile is unavailable right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Account profile API error:", error);
    return NextResponse.json(
      { error: "Profile is unavailable right now." },
      { status: 500 }
    );
  }
}
