import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { feedbackSchema } from "@/lib/validations/feedback";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { event_id, email, score, comment } = parsed.data;

    const supabase = await createClient();

    const { data: event } = await supabase
      .from("events")
      .select("id, ends_at")
      .eq("id", event_id)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (new Date(event.ends_at) > new Date()) {
      return NextResponse.json(
        { error: "Ankieta dostępna po zakończeniu eventu." },
        { status: 400 }
      );
    }

    const { data: person } = await supabase
      .from("people")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (!person) {
      return NextResponse.json(
        { error: "Nie znaleziono zapisu na ten event dla podanego adresu." },
        { status: 404 }
      );
    }

    const { data: registration } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", event_id)
      .eq("person_id", person.id)
      .in("status", ["registered", "waitlisted"])
      .maybeSingle();

    if (!registration) {
      return NextResponse.json(
        { error: "Nie znaleziono zapisu na ten event dla podanego adresu." },
        { status: 404 }
      );
    }

    const { error } = await supabase.from("event_feedback").insert({
      event_id,
      person_id: person.id,
      registration_id: registration.id,
      score,
      comment: comment ?? null,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ankieta dla tego eventu została już wysłana z tego adresu." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[feedback]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
