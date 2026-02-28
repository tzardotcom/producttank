import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, description")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-semibold text-lg">ProductTank</span>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Panel organizatora
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Zarządzaj eventami w jednym miejscu
        </h1>
        <p className="text-muted-foreground mb-10">
          Zapisy, uczestnicy, check-in i feedback – bez rozproszenia na dziesiątki narzędzi.
        </p>

        {event ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Najbliższy event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(event.starts_at).toLocaleString("pl-PL", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
              )}
              <Link href={`/event/${event.id}`}>
                <Button className="mt-4">Zapisz się</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-8 text-center text-muted-foreground">
              Brak nadchodzących eventów. Wkrótce pojawi się tu najbliższy termin.
            </CardContent>
          </Card>
        )}

        <p className="text-sm text-muted-foreground">
          Plan Free: 2 eventy/mies., do 50 uczestników. Upgrade do Pro dla pełnej funkcjonalności.
        </p>
      </main>
    </div>
  );
}
