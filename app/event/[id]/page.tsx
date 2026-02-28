import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/signup-form/signup-form";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, slug, description, starts_at, ends_at")
    .eq("id", id)
    .gt("starts_at", new Date().toISOString())
    .single();

  if (error || !event) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-normal"
          >
            ← Strona główna
          </a>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-10 max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{event.title}</h1>
        <p className="text-muted-foreground mb-8">
          {new Date(event.starts_at).toLocaleString("pl-PL", {
            dateStyle: "long",
            timeStyle: "short",
          })}
          {event.ends_at &&
            ` – ${new Date(event.ends_at).toLocaleTimeString("pl-PL", { timeStyle: "short" })}`}
        </p>
        {event.description && (
          <p className="text-muted-foreground mb-8 whitespace-pre-wrap">{event.description}</p>
        )}
        <SignupForm eventId={event.id} eventTitle={event.title} />
      </main>
    </div>
  );
}
