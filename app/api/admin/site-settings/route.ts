import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../../lib/auth-server";

const defaultSettings = {
  app_name: "InnerLeaf",
  tagline: "Reflect with clarity",
  logo_url: "/logo.png",
};

function textValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 160)
    : fallback;
}

function logoValue(value: unknown) {
  if (typeof value !== "string") {
    return defaultSettings.logo_url;
  }

  const text = value.trim();

  if (!text) {
    return defaultSettings.logo_url;
  }

  if (text.startsWith("/") || text.startsWith("https://")) {
    return text.slice(0, 500);
  }

  return defaultSettings.logo_url;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin.isAdmin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(defaultSettings);
    }

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("app_name, tagline, logo_url")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json({
      app_name: data.app_name || defaultSettings.app_name,
      tagline: data.tagline || defaultSettings.tagline,
      logo_url: data.logo_url || defaultSettings.logo_url,
    });
  } catch (error) {
    console.error("Admin site settings fetch error:", error);
    return NextResponse.json(
      { error: "Site settings are unavailable right now." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin.isAdmin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Site settings are unavailable right now." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const nextSettings = {
      id: "default",
      app_name: textValue(body.app_name, defaultSettings.app_name),
      tagline: textValue(body.tagline, defaultSettings.tagline),
      logo_url: logoValue(body.logo_url),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert(nextSettings, { onConflict: "id" });

    if (error) {
      console.error("Admin site settings update error:", error);
      return NextResponse.json(
        { error: "Site settings could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json(nextSettings);
  } catch (error) {
    console.error("Admin site settings API error:", error);
    return NextResponse.json(
      { error: "Site settings could not be saved." },
      { status: 500 }
    );
  }
}
