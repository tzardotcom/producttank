import Link from "next/link";
import { NewEventForm } from "@/components/new-event-form";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium">Nowy event</span>
      </nav>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">
        Nowy event
      </h1>
      <NewEventForm />
    </div>
  );
}
