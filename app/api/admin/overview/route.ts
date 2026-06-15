import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../../lib/auth-server";

async function tableCount(
  table: "profiles" | "feedback" | "reflections",
  since?: string
) {
  if (!supabaseAdmin) {
    return 0;
  }

  let query = supabaseAdmin
    .from(table)
    .select("*", { count: "exact", head: true });

  if (since) {
    query = query.gte("created_at", since);
  }

  const { count, error } = await query;

  if (error) {
    console.error(`Supabase admin count error for ${table}:`, error);
    return 0;
  }

  return count ?? 0;
}

async function roleCount(role: "user" | "tester" | "admin") {
  if (!supabaseAdmin) {
    return 0;
  }

  const { count, error } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", role);

  if (error) {
    console.error(`Supabase admin role count error for ${role}:`, error);
    return 0;
  }

  return count ?? 0;
}

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

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString();

    const [
      totalUsers,
      totalTesters,
      totalAdmins,
      totalFeedback,
      totalReflections,
      usersLast7Days,
      reflectionsLast7Days,
      feedbackLast7Days,
    ] = await Promise.all([
      tableCount("profiles"),
      roleCount("tester"),
      roleCount("admin"),
      tableCount("feedback"),
      tableCount("reflections"),
      tableCount("profiles", sevenDaysAgo),
      tableCount("reflections", sevenDaysAgo),
      tableCount("feedback", sevenDaysAgo),
    ]);

    return NextResponse.json({
      totalUsers,
      totalTesters,
      totalAdmins,
      totalFeedback,
      totalReflections,
      usersLast7Days,
      reflectionsLast7Days,
      feedbackLast7Days,
    });
  } catch (error) {
    console.error("Admin overview API error:", error);
    return NextResponse.json(
      { error: "Admin data is unavailable right now." },
      { status: 500 }
    );
  }
}
