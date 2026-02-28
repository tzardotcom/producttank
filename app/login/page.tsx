import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Zaloguj się</h1>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          <a href="/" className="hover:underline">← Strona główna</a>
        </p>
      </div>
    </div>
  );
}
