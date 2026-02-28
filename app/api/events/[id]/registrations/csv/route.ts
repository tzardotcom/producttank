import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      status,
      attended,
      created_at,
      people ( email, name )
    `)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  type CsvRow = {
    status: string;
    created_at: string;
    people?: { email: string; name: string | null } | { email: string; name: string | null }[] | null;
  };
  const rawRows: CsvRow[] = (registrations ?? []) as CsvRow[];
  const getPerson = (r: CsvRow) =>
    r.people == null ? null : Array.isArray(r.people) ? r.people[0] ?? null : r.people;
  const header = "Imię i nazwisko,Email,Status,Data zapisu\n";
  const csvRows = rawRows.map((r) => {
    const p = getPerson(r);
    return `"${(p?.name ?? "").replace(/"/g, '""')}","${(p?.email ?? "").replace(/"/g, '""')}","${r.status}","${new Date(r.created_at).toISOString()}"`;
  });
  const csv = header + csvRows.join("\n");
  const bom = "\uFEFF";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="zapisy-${event.title.replace(/[^a-z0-9]/gi, "-")}.csv"`,
    },
  });
}
