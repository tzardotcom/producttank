import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedbackForm } from "@/components/feedback-form";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, ends_at")
    .eq("id", eventId)
    .single();

  if (error || !event) notFound();

  const hasEnded = new Date(event.ends_at) < new Date();
  if (!hasEnded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          Ankieta będzie dostępna po zakończeniu eventu.
        </p>
        <a href="/" className="mt-4 text-sm text-primary hover:underline">
          ← Strona główna
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <a href="/" className="text-sm text-muted-foreground hover:underline">
            ← Strona główna
          </a>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-10 max-w-xl">
        <h1 className="text-2xl font-bold mb-2">Ankieta po evencie</h1>
        <p className="text-muted-foreground mb-6">{event.title}</p>
        <FeedbackForm eventId={event.id} />
      </main>
    </div>
  );
}
