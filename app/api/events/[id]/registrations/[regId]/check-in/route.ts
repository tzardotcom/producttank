import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgPlanFeatures } from "@/lib/plan";

export const dynamic = "force-dynamic";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  const { id: eventId, regId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, organization_id")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const features = await getOrgPlanFeatures(event.organization_id);
  if (!features.checkin) {
    return NextResponse.json(
      { error: "Check-in dostępny w planie Pro." },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("event_registrations")
    .update({ attended: true, updated_at: new Date().toISOString() })
    .eq("id", regId)
    .eq("event_id", eventId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
