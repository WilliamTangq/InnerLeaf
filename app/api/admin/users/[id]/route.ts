import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../../../lib/auth-server";

const roles = new Set(["user", "tester", "admin"]);
const protectedAdminEmail = "admin@gmail.com";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function paramsId(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return params.id;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const userId = await paramsId(context);
    const [profileResult, reflectionsResult, feedbackResult, authUserResult] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("id, email, display_name, avatar_url, avatar_path, role, created_at")
          .eq("id", userId)
          .maybeSingle(),
        supabaseAdmin
          .from("reflections")
          .select("created_at")
          .eq("user_id", userId),
        supabaseAdmin
          .from("feedback")
          .select("created_at")
          .eq("user_id", userId),
        supabaseAdmin.auth.admin.getUserById(userId),
      ]);

    if (profileResult.error || !profileResult.data) {
      console.error("Supabase admin GET user profile error:", profileResult.error);
      return NextResponse.json(
        { error: "User could not be loaded." },
        { status: 404 }
      );
    }

    if (reflectionsResult.error) {
      console.error("Supabase admin GET user reflection count error:", reflectionsResult.error);
    }

    if (feedbackResult.error) {
      console.error("Supabase admin GET user feedback count error:", feedbackResult.error);
    }

    if (authUserResult.error) {
      console.error("Supabase admin GET auth user error:", authUserResult.error);
    }

    const latestReflection = (reflectionsResult.data ?? [])
      .map((item) => item.created_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;
    const latestFeedback = (feedbackResult.data ?? [])
      .map((item) => item.created_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;
    const authUser = authUserResult.data?.user ?? null;

    return NextResponse.json({
      user: {
        ...profileResult.data,
        created_at: authUser?.created_at ?? profileResult.data.created_at,
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
        email_confirmed_at: authUser?.email_confirmed_at ?? null,
        reflection_count: reflectionsResult.data?.length ?? 0,
        feedback_count: feedbackResult.data?.length ?? 0,
        last_reflection_at: latestReflection,
        last_feedback_at: latestFeedback,
      },
    });
  } catch (error) {
    console.error("Admin GET user API error:", error);
    return NextResponse.json(
      { error: "User could not be loaded." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const userId = await paramsId(context);
    const body = (await request.json()) as Record<string, unknown>;
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
      console.error("Supabase admin PATCH user profile fetch error:", profileError);
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

    if (profile.id === admin.user.id && role !== "admin") {
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
      console.error("Supabase admin PATCH user error:", error);
      return NextResponse.json(
        { error: "User could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin PATCH user API error:", error);
    return NextResponse.json(
      { error: "User could not be updated." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const userId = await paramsId(context);

    if (!userId || userId === admin.user.id) {
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
      console.error("Supabase admin DELETE user profile fetch error:", profileError);
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
      console.error("Supabase admin DELETE user reflections error:", reflectionsError);
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
      console.error("Supabase admin DELETE auth user error:", error);
      return NextResponse.json(
        { error: "User could not be deleted." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin DELETE user API error:", error);
    return NextResponse.json(
      { error: "User could not be deleted." },
      { status: 500 }
    );
  }
}
