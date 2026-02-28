"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { track } from "@/lib/analytics/track";

interface SignupFormProps {
  eventId: string;
  eventTitle: string;
}

export function SignupForm({ eventId, eventTitle }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const utm_source = searchParams.get("utm_source") ?? undefined;
  const utm_medium = searchParams.get("utm_medium") ?? undefined;
  const utm_campaign = searchParams.get("utm_campaign") ?? undefined;

  useEffect(() => {
    track("event_page_view", { event_id: eventId, utm_source, utm_medium, utm_campaign });
  }, [eventId, utm_source, utm_medium, utm_campaign]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const consent = (form.elements.namedItem("consent_rodo") as HTMLInputElement).checked;

    track("signup_started", { event_id: eventId, utm_source, utm_medium, utm_campaign });

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          email,
          name,
          consent_rodo: consent,
          utm_source,
          utm_medium,
          utm_campaign,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Coś poszło nie tak. Spróbuj ponownie.");
        return;
      }

      track("signup_completed", {
        event_id: eventId,
        status: data.status ?? "registered",
        source: "event_page",
      });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zapis potwierdzony</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Na podany adres email wysłaliśmy potwierdzenie. Do zobaczenia na evencie!
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
        <CardTitle>Zapisz się na event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input id="name" name="name" required placeholder="Jan Kowalski" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="jan@example.com" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="consent_rodo"
              name="consent_rodo"
              required
              className="rounded border-input"
            />
            <Label htmlFor="consent_rodo" className="font-normal text-sm">
              Wyrażam zgodę na przetwarzanie danych w celu rejestracji i kontaktu w sprawie eventu
              (zgodnie z RODO).
            </Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Zapisuję…" : "Zapisz się"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
