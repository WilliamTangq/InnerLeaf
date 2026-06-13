import { NextResponse } from "next/server";
import { getAdminFromRequest, supabaseAdmin } from "../../../lib/auth-server";

const protectedAdminEmail = "admin@gmail.com";

export async function POST(request: Request) {
  try {
    const { isAdmin, user: currentUser } = await getAdminFromRequest(request);

    if (!isAdmin || !currentUser) {
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

    const body = (await request.json()) as Record<string, unknown>;
    const userId = typeof body.userId === "string" ? body.userId : "";

    if (!userId || userId === currentUser.id) {
      return NextResponse.json(
        { error: "User could not be deleted." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Supabase admin delete profile fetch error:", profileError);
      return NextResponse.json(
        { error: "User could not be deleted." },
        { status: 404 }
      );
    }

    if (
      profile.role === "admin" ||
      profile.email?.toLowerCase() === protectedAdminEmail
    ) {
      return NextResponse.json(
        { error: "Admin users cannot be deleted during MVP." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Supabase admin delete user error:", error);
      return NextResponse.json(
        { error: "User could not be deleted." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin delete-user API error:", error);
    return NextResponse.json(
      { error: "User could not be deleted." },
      { status: 500 }
    );
  }
}
