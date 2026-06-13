import { NextResponse } from "next/server";
import { getAdminFromRequest, supabaseAdmin } from "../../../lib/auth-server";

const roles = new Set(["user", "tester", "admin"]);
const protectedAdminEmail = "admin@gmail.com";

export async function POST(request: Request) {
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

    const body = (await request.json()) as {
      userId?: unknown;
      role?: unknown;
    };
    const userId = typeof body.userId === "string" ? body.userId : "";
    const role = typeof body.role === "string" ? body.role : "";

    if (!userId || !roles.has(role)) {
      return NextResponse.json(
        { error: "Role could not be updated." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Supabase admin role profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Role could not be updated." },
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

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Supabase admin update role error:", error);
      return NextResponse.json(
        { error: "Role could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin update role API error:", error);
    return NextResponse.json(
      { error: "Role could not be updated." },
      { status: 500 }
    );
  }
}
