import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Users,
  CheckSquare,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, description")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const features = [
    {
      icon: Calendar,
      title: "Eventy w jednym miejscu",
      description: "Twórz i zarządzaj eventami, ustaw daty i opisy. Wszystko w jednym panelu.",
    },
    {
      icon: Users,
      title: "Zapisy i lista gości",
      description: "Uczestnicy zapisują się przez formularz. Lista zapisanych, waitlisty i limity.",
    },
    {
      icon: CheckSquare,
      title: "Check-in na miejscu",
      description: "Oznaczaj przybycia, eksportuj listy do CSV. Prosty check-in bez drukowania.",
    },
    {
      icon: MessageSquare,
      title: "Feedback po evencie",
      description: "Zbieraj opinie po spotkaniu. Automatyczne przypomnienia i podsumowania.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header: logo + Zaloguj + Zarejestruj (PhantomBuster: minimal nav, clear CTAs) */}
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="font-semibold text-lg text-foreground">
            ProductTank
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">Panel organizatora</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Zaloguj się
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Zarejestruj się</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero – jeden główny CTA */}
        <section className="container mx-auto px-4 py-20 sm:py-28 max-w-4xl text-center">
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-normal fill-mode-forwards">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 sm:text-5xl md:text-6xl">
              Zarządzaj eventami w jednym miejscu
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto sm:text-xl">
              Zapisy, uczestnicy, check-in i feedback – bez rozproszenia na dziesiątki narzędzi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Utwórz konto za darmo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Zaloguj się
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features – 4 karty (brief: features section) */}
        <section className="border-t border-border/80 bg-muted/30 py-16 sm:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-bold text-foreground text-center mb-12 sm:text-3xl">
              Wszystko, czego potrzebujesz do eventów
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }, i) => (
                <Card
                  key={title}
                  className={`animate-in fade-in-0 slide-in-from-bottom-2 duration-normal fill-mode-forwards ${i === 0 ? "delay-150" : i === 1 ? "delay-200" : i === 2 ? "delay-250" : "delay-300"}`}
                >
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Najbliższy event + CTA */}
        <section className="container mx-auto px-4 py-16 max-w-2xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Najbliższy event</h2>
          {event ? (
            <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-normal delay-150 fill-mode-forwards">
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {new Date(event.starts_at).toLocaleString("pl-PL", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href={`/event/${event.id}`}>
                    <Button size="lg">Zapisz się na event</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="lg">
                      Zostań organizatorem
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <p className="mb-4">Brak nadchodzących eventów. Wkrótce pojawi się tu najbliższy termin.</p>
                <Link href="/register">
                  <Button>Utwórz konto i dodaj pierwszy event</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* CTA strip */}
        <section className="border-t border-border/80 bg-muted/30 py-14">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Zacznij zarządzać eventami już dziś
            </h2>
            <p className="text-muted-foreground mb-6">
              Załóż konto w minutę. Plan Free: 2 eventy miesięcznie, do 50 uczestników.
            </p>
            <Link href="/register">
              <Button size="lg">Zarejestruj się za darmo</Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-semibold text-foreground">ProductTank</span>
            <p className="text-sm text-muted-foreground">
              Plan Free: 2 eventy/mies., do 50 uczestników. Upgrade do Pro dla pełnej funkcjonalności.
            </p>
            <Link href="/login" className="text-sm text-primary hover:underline">
              Zaloguj się
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
