"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (err) {
        setError(err.message ?? "Rejestracja nie powiodła się.");
        return;
      }
      if (data?.user?.identities?.length === 0) {
        setError("Konto z tym adresem email już istnieje. Zaloguj się.");
        return;
      }
      if (data?.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-6 text-center">
        <p className="font-medium text-foreground">Sprawdź swoją skrzynkę email</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Wysłaliśmy link do potwierdzenia konta. Kliknij w link w wiadomości, aby aktywować konto i zalogować się.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Przejdź do logowania →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          required
          placeholder="jan@example.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Hasło</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">Minimum 6 znaków</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Tworzenie konta…" : "Zarejestruj się"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
