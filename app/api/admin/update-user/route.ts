import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../../lib/auth-server";

const roles = new Set(["user", "tester", "admin"]);
const protectedAdminEmail = "admin@gmail.com";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin.isAdmin) {
      return NextResponse.json({ error: admin.error }, { status: 403 });
    }

    const currentUser = admin.user;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin data is unavailable right now." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const userId = typeof body.userId === "string" ? body.userId : "";
    const role = typeof body.role === "string" ? body.role : "";

    if (!userId || !roles.has(role)) {
      return NextResponse.json(
        { error: "User could not be updated." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Supabase admin update-user profile fetch error:", profileError);
      return NextResponse.json(
        { error: "User could not be updated." },
        { status: 404 }
      );
    }

    if (
      profile.email?.toLowerCase() === protectedAdminEmail &&
      role !== "admin"
    ) {
      return NextResponse.json(
        { error: "The protected admin account must remain admin." },
        { status: 400 }
      );
    }

    if (profile.id === currentUser.id && role !== "admin") {
      return NextResponse.json(
        { error: "You cannot remove your own admin access." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        role,
        display_name: optionalText(body.display_name),
        avatar_url: optionalText(body.avatar_url),
        avatar_path: optionalText(body.avatar_path),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Supabase admin update-user error:", error);
      return NextResponse.json(
        { error: "User could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin update-user API error:", error);
    return NextResponse.json(
      { error: "User could not be updated." },
      { status: 500 }
    );
  }
}
