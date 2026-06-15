import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth-server";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin.isAdmin) {
      return NextResponse.json({ error: admin.error }, { status: 403 });
    }

    return NextResponse.json({
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  } catch (error) {
    console.error("Admin system API error:", error);
    return NextResponse.json(
      { error: "Admin data is unavailable right now." },
      { status: 500 }
    );
  }
}
