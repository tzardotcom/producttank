"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NewEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem("description") as HTMLInputElement).value.trim();
    const startsAt = (form.elements.namedItem("starts_at") as HTMLInputElement).value;
    const endsAt = (form.elements.namedItem("ends_at") as HTMLInputElement).value;
    const maxAttendees = (form.elements.namedItem("max_attendees") as HTMLInputElement).value;

    if (!title || !startsAt) {
      setError("Tytuł i data rozpoczęcia są wymagane.");
      return;
    }

    const startsAtIso = new Date(startsAt).toISOString();
    const endsAtIso = endsAt ? new Date(endsAt).toISOString() : undefined;
    const max = maxAttendees ? parseInt(maxAttendees, 10) : undefined;
    if (max !== undefined && (isNaN(max) || max < 1)) {
      setError("Maks. liczba uczestników musi być liczbą większą od zera.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          starts_at: startsAtIso,
          ends_at: endsAtIso,
          max_attendees: max ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Nie udało się utworzyć eventu.");
        return;
      }
      router.push(`/dashboard/events/${data.id}/registrations`);
      router.refresh();
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().slice(0, 16);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Nowy event</CardTitle>
        <p className="text-sm text-muted-foreground">
          Wypełnij dane. Po zapisaniu przejdziesz do listy zapisów.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="np. ProductTank #42 – Roadmapping"
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Opis (opcjonalnie)</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Krótki opis eventu dla uczestników"
              maxLength={5000}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Rozpoczęcie *</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
                min={today}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Zakończenie (opcjonalnie)</Label>
              <Input id="ends_at" name="ends_at" type="datetime-local" />
              <p className="text-xs text-muted-foreground">
                Puste = 2 godziny po rozpoczęciu
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_attendees">Maks. uczestników (opcjonalnie)</Label>
            <Input
              id="max_attendees"
              name="max_attendees"
              type="number"
              min={1}
              max={10000}
              placeholder="np. 50"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Tworzenie…" : "Utwórz event"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Anuluj</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
