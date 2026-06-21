import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../../lib/auth-server";

const trackedEvents = [
  "landing_page_viewed",
  "hero_create_account_clicked",
  "hero_view_demo_clicked",
  "register_completed",
  "login_completed",
  "quick_reflection_started",
  "guided_reflection_started",
  "reflection_generated",
  "reflection_saved",
  "history_viewed",
  "summary_viewed",
  "check_in_completed",
  "feedback_submitted",
] as const;

type TrackedEventName = (typeof trackedEvents)[number];
type EventCounts = Record<TrackedEventName, number | null>;
type TrendPoint = {
  label: string;
  users: number;
  reflections: number;
  feedback: number;
};

async function safeCount(
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
    console.error(`Supabase metrics count error for ${table}:`, error);
    return 0;
  }

  return count ?? 0;
}

async function modeCount(mode: "quick" | "guided", since?: string) {
  if (!supabaseAdmin) {
    return 0;
  }

  let query = supabaseAdmin
    .from("reflections")
    .select("*", { count: "exact", head: true })
    .eq("mode", mode);

  if (since) {
    query = query.gte("created_at", since);
  }

  const { count, error } = await query;

  if (error) {
    console.error(`Supabase metrics mode count error for ${mode}:`, error);
    return 0;
  }

  return count ?? 0;
}

async function feedbackSignal(column: string, value: string) {
  if (!supabaseAdmin) {
    return 0;
  }

  const { count, error } = await supabaseAdmin
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq(column, value);

  if (error) {
    console.error(`Supabase metrics feedback count error for ${column}:`, error);
    return 0;
  }

  return count ?? 0;
}

async function optionalAnalyticsEventCounts() {
  if (!supabaseAdmin) {
    return { connected: false, counts: null as EventCounts | null };
  }

  const { data, error } = await supabaseAdmin
    .from("analytics_events")
    .select("event_name");

  if (error) {
    return { connected: false, counts: null as EventCounts | null };
  }

  const counts = trackedEvents.reduce((current, event) => {
    current[event] = 0;
    return current;
  }, {} as EventCounts);

  for (const item of data ?? []) {
    const eventName = item.event_name as TrackedEventName;
    if (eventName in counts) {
      counts[eventName] = (counts[eventName] ?? 0) + 1;
    }
  }

  return { connected: true, counts };
}

function dateRange(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    return {
      start: date,
      end: next,
      label: date.toLocaleDateString("en-AU", {
        month: "short",
        day: "numeric",
      }),
    };
  });
}

async function recordsByDay(table: "profiles" | "feedback" | "reflections") {
  if (!supabaseAdmin) {
    return new Map<string, number>();
  }

  const days = dateRange(7);
  const { data, error } = await supabaseAdmin
    .from(table)
    .select("created_at")
    .gte("created_at", days[0].start.toISOString());

  if (error) {
    console.error(`Supabase trend error for ${table}:`, error);
    return new Map<string, number>();
  }

  return days.reduce((counts, day) => {
    const count =
      data?.filter((item) => {
        const created = new Date(item.created_at as string);
        return created >= day.start && created < day.end;
      }).length ?? 0;

    counts.set(day.label, count);
    return counts;
  }, new Map<string, number>());
}

async function activityTrend(): Promise<TrendPoint[]> {
  const days = dateRange(7);
  const [users, reflections, feedback] = await Promise.all([
    recordsByDay("profiles"),
    recordsByDay("reflections"),
    recordsByDay("feedback"),
  ]);

  return days.map((day) => ({
    label: day.label,
    users: users.get(day.label) ?? 0,
    reflections: reflections.get(day.label) ?? 0,
    feedback: feedback.get(day.label) ?? 0,
  }));
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin.isAdmin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Founder metrics are unavailable right now." },
        { status: 500 }
      );
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString();

    const [
      totalUsers,
      usersLast7Days,
      totalFeedback,
      feedbackLast7Days,
      totalReflections,
      reflectionsLast7Days,
      quickSaved,
      guidedSaved,
      quickSavedLast7Days,
      guidedSavedLast7Days,
      positiveFeedback,
      repeatIntent,
      analytics,
      trend,
    ] = await Promise.all([
      safeCount("profiles"),
      safeCount("profiles", sevenDaysAgo),
      safeCount("feedback"),
      safeCount("feedback", sevenDaysAgo),
      safeCount("reflections"),
      safeCount("reflections", sevenDaysAgo),
      modeCount("quick"),
      modeCount("guided"),
      modeCount("quick", sevenDaysAgo),
      modeCount("guided", sevenDaysAgo),
      feedbackSignal("clarity_help", "Yes"),
      feedbackSignal("would_use_again", "Yes"),
      optionalAnalyticsEventCounts(),
      activityTrend(),
    ]);

    return NextResponse.json({
      trackedEvents,
      eventCounts: analytics.counts,
      analyticsConnected: analytics.connected,
      activityTrend: trend,
      databaseMetrics: {
        totalUsers,
        usersLast7Days,
        totalFeedback,
        feedbackLast7Days,
        totalReflections,
        reflectionsLast7Days,
        quickSaved,
        guidedSaved,
        quickSavedLast7Days,
        guidedSavedLast7Days,
        positiveFeedback,
        repeatIntent,
      },
    });
  } catch (error) {
    console.error("Founder metrics API error:", error);
    return NextResponse.json(
      { error: "Founder metrics are unavailable right now." },
      { status: 500 }
    );
  }
}
