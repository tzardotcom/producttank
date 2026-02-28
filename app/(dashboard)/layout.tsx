import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

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

  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar events={events ?? []} />
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-2 border-b border-border/80 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </header>
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
