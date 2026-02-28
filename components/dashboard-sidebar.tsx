"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  Calendar,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EventItem = { id: string; title: string };

export function DashboardSidebar({ events = [] }: { events?: EventItem[] }) {
  const pathname = usePathname();

  const isHome = pathname === "/dashboard" || pathname === "/dashboard/";
  const isRetention = pathname?.startsWith("/dashboard/retention");
  const isEvent = pathname?.includes("/dashboard/events/");

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-muted/30 min-h-screen">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Link href="/dashboard" className="font-semibold text-foreground flex items-center gap-2">
          ProductTank
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isHome
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/dashboard/retention"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isRetention
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Metryki i retencja
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade plan
        </Link>
      </nav>
      {events.length > 0 && (
        <div className="border-t border-border p-3">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ostatnie eventy
          </p>
          <ul className="space-y-0.5">
            {events.slice(0, 8).map((event) => {
              const isActive = pathname?.includes(`/dashboard/events/${event.id}`);
              return (
                <li key={event.id}>
                  <Link
                    href={`/dashboard/events/${event.id}/registrations`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors line-clamp-1",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{event.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="border-t border-border p-3">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Wyloguj
          </button>
        </form>
      </div>
    </aside>
  );
}
