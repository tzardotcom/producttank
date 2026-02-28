import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrgPlanFeatures } from "@/lib/plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RetentionPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, organization_id, title, starts_at, ends_at")
    .order("starts_at", { ascending: false });

  if (!events?.length) {
    return (
      <div className="max-w-4xl">
        <p className="mb-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Home
          </Link>
        </p>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Brak eventów. Metryki retencji pojawią się po dodaniu eventów i zapisów.
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstOrgId = events[0].organization_id;
  const planFeatures = await getOrgPlanFeatures(firstOrgId);

  if (!planFeatures.retention) {
    return (
      <div className="max-w-4xl">
        <p className="mb-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Home
          </Link>
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Retencja i metryki</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>Dashboard retencji jest dostępny w planie Pro.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventIds = events.map((e) => e.id);

  const { data: regs } = await supabase
    .from("event_registrations")
    .select("event_id, attended, person_id")
    .in("event_id", eventIds)
    .in("status", ["registered", "waitlisted"]);

  const { data: feedbacks } = await supabase
    .from("event_feedback")
    .select("event_id, score")
    .in("event_id", eventIds);

  const registeredByEvent = new Map<string, number>();
  const attendedByEvent = new Map<string, number>();
  for (const r of regs ?? []) {
    registeredByEvent.set(r.event_id, (registeredByEvent.get(r.event_id) ?? 0) + 1);
    if (r.attended) {
      attendedByEvent.set(r.event_id, (attendedByEvent.get(r.event_id) ?? 0) + 1);
    }
  }

  const feedbackByEvent = new Map<string, { sum: number; count: number }>();
  for (const f of feedbacks ?? []) {
    const cur = feedbackByEvent.get(f.event_id) ?? { sum: 0, count: 0 };
    feedbackByEvent.set(f.event_id, {
      sum: cur.sum + (f.score ?? 0),
      count: cur.count + 1,
    });
  }

  const personAttendances = new Map<string, number>();
  for (const r of regs ?? []) {
    if (r.attended && r.person_id) {
      personAttendances.set(r.person_id, (personAttendances.get(r.person_id) ?? 0) + 1);
    }
  }
  const repeatAttendees = Array.from(personAttendances.values()).filter((c) => c >= 2).length;

  return (
    <div className="max-w-4xl">
      <p className="mb-4">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Home
        </Link>
      </p>
      <h1 className="text-2xl font-bold mb-6">Retencja i metryki</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Podsumowanie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Uczestnicy obecni na więcej niż jednym evencie: <strong>{repeatAttendees}</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metryki per event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Zapisani</th>
                  <th className="py-2 pr-4">Obecni</th>
                  <th className="py-2 pr-4">Show-up rate</th>
                  <th className="py-2">Śr. ocena</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const reg = registeredByEvent.get(event.id) ?? 0;
                  const att = attendedByEvent.get(event.id) ?? 0;
                  const showUp = reg > 0 ? Math.round((att / reg) * 100) : 0;
                  const fb = feedbackByEvent.get(event.id);
                  const avgScore = fb && fb.count > 0 ? (fb.sum / fb.count).toFixed(1) : "—";
                  return (
                    <tr key={event.id} className="border-b">
                      <td className="py-2 pr-4">
                        <Link
                          href={`/dashboard/events/${event.id}/registrations`}
                          className="hover:underline"
                        >
                          {event.title}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">
                        {new Date(event.starts_at).toLocaleString("pl-PL", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-2 pr-4">{reg}</td>
                      <td className="py-2 pr-4">{att}</td>
                      <td className="py-2 pr-4">{showUp}%</td>
                      <td className="py-2">{avgScore}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
