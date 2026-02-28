import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendFeedbackFollowUpEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isProduction =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const validAuth = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;
  if (isProduction && !CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is required in production" },
      { status: 500 }
    );
  }
  if (isProduction && !validAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (CRON_SECRET && !validAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const yesterdayEnd = new Date(now);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);
  const yesterdayStart = new Date(yesterdayEnd);
  yesterdayStart.setHours(0, 0, 0, 0);

  const { data: events } = await supabase
    .from("events")
    .select("id, organization_id, title")
    .gte("ends_at", yesterdayStart.toISOString())
    .lte("ends_at", yesterdayEnd.toISOString());

  if (!events?.length) {
    return NextResponse.json({ sent: 0, message: "No events ended yesterday" });
  }

  let sent = 0;
  for (const event of events) {
    const { data: regs } = await supabase
      .from("event_registrations")
      .select("id, people ( email, name )")
      .eq("event_id", event.id)
      .in("status", ["registered", "waitlisted"]);

    const list = (regs ?? []) as Array<{
      id: string;
      people: { email: string; name: string | null } | { email: string; name: string | null }[] | null;
    }>;
    const feedbackUrl = `${APP_URL}/feedback/${event.id}`;

    for (const r of list) {
      const p = Array.isArray(r.people) ? r.people[0] : r.people;
      if (!p?.email) continue;
      const result = await sendFeedbackFollowUpEmail({
        to: p.email,
        personName: p.name ?? "Uczestniku",
        eventTitle: event.title,
        feedbackUrl,
      });
      if (result.id) {
        await supabase.from("email_logs").insert({
          organization_id: event.organization_id,
          event_id: event.id,
          template_key: "follow_up",
          provider_id: result.id,
        });
        sent++;
      }
    }
  }

  return NextResponse.json({ sent });
}
