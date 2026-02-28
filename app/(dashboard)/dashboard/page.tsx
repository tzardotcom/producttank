import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, slug, starts_at")
    .order("starts_at", { ascending: false });

  if (error) {
    return (
      <div className="text-destructive">
        Błąd ładowania eventów. Upewnij się, że należysz do organizacji.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Eventy</h1>
        <Link href="/dashboard/retention">
          <Button variant="outline" size="sm">
            Retencja i metryki
          </Button>
        </Link>
      </div>
      {events?.length ? (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id}>
              <Card>
                <CardHeader className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link
                          href={`/dashboard/events/${event.id}/registrations`}
                          className="hover:underline"
                        >
                          {event.title}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(event.starts_at).toLocaleString("pl-PL", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <Link href={`/dashboard/events/${event.id}/registrations`}>
                      <Button variant="outline" size="sm">
                        Zapisani
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p className="mb-2">Brak eventów w Twojej organizacji.</p>
            <p className="text-sm">
              Dodaj event w Supabase (tabela <code className="bg-muted px-1 rounded">events</code>) lub
              skontaktuj się z administratorem.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
