import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/auth-server";

const scenarioIds = new Set([
  "delayed_reply",
  "study_pressure",
  "social_comparison",
]);
const clarityResponses = new Set(["yes", "somewhat", "no"]);
const alternatives = new Set([
  "chatgpt",
  "friend",
  "notes",
  "social_media",
  "nothing",
]);
const patternInterests = new Set(["yes", "maybe", "no"]);

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalEmail(value: unknown) {
  const text = safeString(value);
  return text && text.includes("@") ? text.slice(0, 180) : null;
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Marketplace feedback is unavailable right now." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const scenarioId = safeString(body.scenario_id);
    const clarity = safeString(body.clarity_response);
    const alternative = safeString(body.alternative_selected);
    const patternInterest = safeString(body.pattern_interest);
    const locale = safeString(body.locale);

    if (
      !scenarioIds.has(scenarioId) ||
      !clarityResponses.has(clarity) ||
      !alternatives.has(alternative) ||
      !patternInterests.has(patternInterest)
    ) {
      return NextResponse.json(
        { error: "Marketplace feedback is incomplete." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("marketplace_feedback")
      .insert({
        locale: locale === "zh" ? "zh" : "en",
        scenario_id: scenarioId,
        clarity_response: clarity,
        alternative_selected: alternative,
        pattern_interest: patternInterest,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase marketplace feedback insert error:", error);
      return NextResponse.json(
        { error: "Marketplace feedback could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    console.error("Marketplace feedback API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving feedback." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Marketplace feedback is unavailable right now." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = safeString(body.id);
    const betaEmail = optionalEmail(body.beta_email);

    if (!id || !betaEmail) {
      return NextResponse.json(
        { error: "Beta signup is incomplete." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("marketplace_feedback")
      .update({
        beta_email: betaEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Supabase marketplace feedback update error:", error);
      return NextResponse.json(
        { error: "Beta signup could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Marketplace feedback update API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving beta signup." },
      { status: 500 }
    );
  }
}
