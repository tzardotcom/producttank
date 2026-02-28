import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/register-form";
import { Button } from "@/components/ui/button";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="font-semibold text-lg text-foreground">
            ProductTank
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Zaloguj się
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-normal fill-mode-forwards">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Utwórz konto</h1>
            <p className="text-sm text-muted-foreground">
              Zacznij zarządzać eventami w jednym miejscu.
            </p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              ← Strona główna
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
