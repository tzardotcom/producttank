import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="font-semibold text-lg text-foreground">
            ProductTank – Panel
          </a>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-normal"
            >
              Wyloguj
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
