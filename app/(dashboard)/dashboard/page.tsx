import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, updated_at")
    .order("starts_at", { ascending: false });

  if (error) {
    return (
      <div className="text-destructive">
        Błąd ładowania eventów. Upewnij się, że należysz do organizacji.
      </div>
    );
  }

  const eventIds = (events ?? []).map((e) => e.id);
  const registrationCounts: Record<string, number> = {};
  if (eventIds.length > 0) {
    const { data: regs } = await supabase
      .from("event_registrations")
      .select("event_id")
      .in("event_id", eventIds)
      .in("status", ["registered", "waitlisted"]);
    (regs ?? []).forEach((r: { event_id: string }) => {
      registrationCounts[r.event_id] = (registrationCounts[r.event_id] ?? 0) + 1;
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Home</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="#">Nowy workspace</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Nowy event
            </Link>
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Ostatnie eventy
        </h2>
        {events?.length ? (
          <ul className="space-y-2">
            {events.map((event) => {
              const count = registrationCounts[event.id] ?? 0;
              const editedAt = event.updated_at
                ? new Date(event.updated_at).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "short",
                  })
                : null;
              return (
                <li key={event.id}>
                  <Link href={`/dashboard/events/${event.id}/registrations`}>
                    <Card className="transition-all duration-normal hover:shadow-md">
                      <CardContent className="py-4 px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{event.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {count} {count === 1 ? "zapis" : "zapisów"}
                            {editedAt && ` · Edytowano ${editedAt}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.starts_at).toLocaleString("pl-PL", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">Brak eventów</p>
              <p className="text-sm mb-4">
                Dodaj event w Supabase (tabela <code className="bg-muted px-1.5 py-0.5 rounded">events</code>) lub
                skontaktuj się z administratorem. Wkrótce: przycisk „Nowy event” umożliwi tworzenie eventów z poziomu aplikacji.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/retention">Metryki i retencja</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
