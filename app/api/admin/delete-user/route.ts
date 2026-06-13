import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../../lib/auth-server";

const protectedAdminEmail = "admin@gmail.com";

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

    if (!userId || userId === currentUser.id) {
      return NextResponse.json(
        { error: "User could not be deleted." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, avatar_path")
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

    if (profile.avatar_path) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("avatars")
        .remove([profile.avatar_path]);

      if (storageError) {
        console.error("Supabase admin avatar delete error:", storageError);
      }
    }

    const { error: reflectionsError } = await supabaseAdmin
      .from("reflections")
      .delete()
      .eq("user_id", userId);

    if (reflectionsError) {
      console.error("Supabase admin delete reflections error:", reflectionsError);
      return NextResponse.json(
        { error: "User could not be deleted." },
        { status: 500 }
      );
    }

    const { error: feedbackError } = await supabaseAdmin
      .from("feedback")
      .update({ user_id: null })
      .eq("user_id", userId);

    if (feedbackError) {
      console.error("Supabase admin anonymise feedback error:", feedbackError);
      return NextResponse.json(
        { error: "User could not be deleted." },
        { status: 500 }
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
