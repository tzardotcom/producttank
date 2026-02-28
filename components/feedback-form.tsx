"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { track } from "@/lib/analytics/track";

interface FeedbackFormProps {
  eventId: string;
}

export function FeedbackForm({ eventId }: FeedbackFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const score = parseInt((form.elements.namedItem("score") as HTMLSelectElement).value, 10);
    const comment = (form.elements.namedItem("comment") as HTMLTextAreaElement).value.trim();

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, email, score, comment: comment || undefined }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Coś poszło nie tak. Spróbuj ponownie.");
        return;
      }

      track("feedback_submitted", { event_id: eventId, source: "feedback_page" });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dziękujemy!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Twoja opinia została zapisana. Dziękujemy za udział w evencie.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
            Wróć na stronę główną
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jak oceniasz event?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (ten sam, na który się zapisywałeś)</Label>
            <Input id="email" name="email" type="email" required placeholder="jan@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Ocena (1–5)</Label>
            <select
              id="score"
              name="score"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Wybierz</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Komentarz (opcjonalnie)</Label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              maxLength={2000}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Co moglibyśmy poprawić?"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Wysyłam…" : "Wyślij"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
