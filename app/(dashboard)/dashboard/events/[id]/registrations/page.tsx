import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrgPlanFeatures } from "@/lib/plan";
import { CheckInButton } from "@/components/check-in-button";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, starts_at, organization_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event) notFound();

  const planFeatures = await getOrgPlanFeatures(event.organization_id);

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      id,
      status,
      attended,
      created_at,
      people ( id, email, name )
    `)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  type RegRow = {
    id: string;
    status: string;
    attended: boolean;
    created_at: string;
    people: { id: string; email: string; name: string | null } | { id: string; email: string; name: string | null }[] | null;
  };
  const rawList = (registrations ?? []) as unknown;
  const list = (Array.isArray(rawList) ? rawList : []) as RegRow[];
  const getPerson = (r: RegRow) => (Array.isArray(r.people) ? r.people[0] : r.people);

  return (
    <div className="max-w-4xl">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-foreground font-medium">{event.title}</span>
        <span aria-hidden>/</span>
        <span className="text-muted-foreground">Zapisani</span>
      </nav>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">{event.title}</h1>
      <p className="text-muted-foreground mb-6">
        {new Date(event.starts_at).toLocaleString("pl-PL", { dateStyle: "long", timeStyle: "short" })}
      </p>
      <div className="flex gap-2 mb-6">
        <a href={`/api/events/${eventId}/registrations/csv`}>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </a>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Zapisani ({list.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-muted-foreground">Brak zapisów.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Imię / nazwa</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Data zapisu</th>
                    {planFeatures.checkin && <th className="py-2">Check-in</th>}
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => {
                    const p = getPerson(r);
                    return (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-4">{p?.name ?? "—"}</td>
                      <td className="py-2 pr-4">{p?.email ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={
                            r.status === "waitlisted"
                              ? "text-amber-600"
                              : r.status === "cancelled"
                                ? "text-muted-foreground"
                                : ""
                          }
                        >
                          {r.status === "registered"
                            ? "Zapisany"
                            : r.status === "waitlisted"
                              ? "Lista rezerwowa"
                              : "Anulowany"}
                        </span>
                      </td>
                      <td className="py-2">
                        {new Date(r.created_at).toLocaleString("pl-PL", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      {planFeatures.checkin && (
                        <td className="py-2">
                          <CheckInButton
                            registrationId={r.id}
                            eventId={eventId}
                            attended={r.attended}
                            disabled={r.status === "cancelled"}
                          />
                        </td>
                      )}
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
