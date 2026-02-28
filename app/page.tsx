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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky header – PhantomBuster style: minimal, one CTA */}
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-semibold text-lg text-foreground">ProductTank</span>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Panel organizatora
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-2xl">
        {/* Hero – single headline + CTA feel (PhantomBuster-style) */}
        <section className="animate-in fade-in-0 slide-in-from-bottom-2 duration-normal fill-mode-forwards mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3 sm:text-5xl">
            Zarządzaj eventami w jednym miejscu
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl">
            Zapisy, uczestnicy, check-in i feedback – bez rozproszenia na dziesiątki narzędzi.
          </p>
        </section>

        {/* Event card – clear hierarchy, primary CTA */}
        {event ? (
          <Card className="mb-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-normal delay-150 fill-mode-forwards">
            <CardHeader>
              <CardTitle className="text-xl">Najbliższy event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-foreground">{event.title}</p>
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
                <Button size="lg" className="mt-4">
                  Zapisz się
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-normal delay-150 fill-mode-forwards">
            <CardContent className="py-10 text-center text-muted-foreground">
              Brak nadchodzących eventów. Wkrótce pojawi się tu najbliższy termin.
            </CardContent>
          </Card>
        )}

        <p className="text-sm text-muted-foreground animate-in fade-in-0 duration-normal delay-300 fill-mode-forwards">
          Plan Free: 2 eventy/mies., do 50 uczestników. Upgrade do Pro dla pełnej funkcjonalności.
        </p>
      </main>
    </div>
  );
}
