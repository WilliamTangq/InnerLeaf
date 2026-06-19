import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/auth-server";

const defaultSettings = {
  app_name: "InnerLeaf",
  tagline: "Reflect with clarity",
  logo_url: "/logo.png",
};

export async function GET() {
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
}
