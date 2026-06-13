"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isTestEnvironment =
  process.env.NODE_ENV === "test" ||
  process.env.PLAYWRIGHT === "true" ||
  process.env.CI === "true";

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === "production" && !isTestEnvironment) {
    throw new Error("Missing Supabase browser environment variables");
  }
}

export const hasSupabaseBrowserEnv = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseBrowser = hasSupabaseBrowserEnv
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
