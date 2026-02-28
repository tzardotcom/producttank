import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReminderEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const { data: events } = await supabase
    .from("events")
    .select("id, organization_id, title, starts_at")
    .gte("starts_at", tomorrowStart.toISOString())
    .lte("starts_at", tomorrowEnd.toISOString());

  if (!events?.length) {
    return NextResponse.json({ sent: 0, message: "No events tomorrow" });
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
    const startsAt = new Date(event.starts_at).toLocaleString("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    for (const r of list) {
      const p = Array.isArray(r.people) ? r.people[0] : r.people;
      if (!p?.email) continue;
      const result = await sendReminderEmail({
        to: p.email,
        personName: p.name ?? "Uczestniku",
        eventTitle: event.title,
        eventStartsAt: startsAt,
      });
      if (result.id) {
        await supabase.from("email_logs").insert({
          organization_id: event.organization_id,
          event_id: event.id,
          template_key: "reminder",
          provider_id: result.id,
        });
        sent++;
      }
    }
  }

  return NextResponse.json({ sent });
}
