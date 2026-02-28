import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/signup";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { event_id, email, name, consent_rodo, utm_source, utm_medium, utm_campaign } = parsed.data;

    const supabase = createAdminClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, organization_id, title, starts_at")
      .eq("id", event_id)
      .gt("starts_at", new Date().toISOString())
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found or registration closed" }, { status: 404 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("plan_id")
      .eq("id", event.organization_id)
      .single();

    if (org?.plan_id) {
      const { data: plan } = await supabase
        .from("plans")
        .select("max_attendees_per_event, features")
        .eq("id", org.plan_id)
        .single();

      if (plan?.max_attendees_per_event != null) {
        const { count } = await supabase
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event_id)
          .in("status", ["registered", "waitlisted"]);

        if (count != null && count >= plan.max_attendees_per_event) {
          const allowWaitlist = plan.features && (plan.features as Record<string, boolean>).waitlist;
          if (!allowWaitlist) {
            return NextResponse.json(
              { error: "Brak wolnych miejsc na ten event." },
              { status: 409 }
            );
          }
        }
      }
    }

    let personId: string;
    const { data: existingPerson } = await supabase
      .from("people")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingPerson) {
      personId = existingPerson.id;
      await supabase
        .from("people")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", personId);
    } else {
      const { data: newPerson, error: insertPersonError } = await supabase
        .from("people")
        .insert({ email: email.toLowerCase(), name })
        .select("id")
        .single();
      if (insertPersonError || !newPerson) {
        return NextResponse.json({ error: "Could not create registration" }, { status: 500 });
      }
      personId = newPerson.id;
    }

    const status =
      (await (async () => {
        const { count } = await supabase
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event_id)
          .in("status", ["registered", "waitlisted"]);
        const { data: planRow } = org?.plan_id
          ? await supabase.from("plans").select("max_attendees_per_event, features").eq("id", org.plan_id).single()
          : { data: null };
        const limit = planRow?.max_attendees_per_event;
        const atLimit = limit != null && count != null && count >= limit;
        const waitlist = planRow?.features && (planRow.features as Record<string, boolean>).waitlist;
        return atLimit && waitlist ? "waitlisted" : "registered";
      })());

    const { error: regError } = await supabase.from("event_registrations").upsert(
      {
        event_id,
        person_id: personId,
        status,
        utm_source: utm_source ?? null,
        utm_medium: utm_medium ?? null,
        utm_campaign: utm_campaign ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,person_id", ignoreDuplicates: false }
    );

    if (regError) {
      return NextResponse.json({ error: "Registration failed", details: regError.message }, { status: 500 });
    }

    const emailResult = await sendConfirmationEmail({
      to: email,
      personName: name,
      eventTitle: event.title,
      eventStartsAt: new Date(event.starts_at).toLocaleString("pl-PL"),
    });

    if (emailResult.id) {
      await supabase.from("email_logs").insert({
        organization_id: event.organization_id,
        person_id: personId,
        event_id: event.id,
        template_key: "confirmation",
        provider_id: emailResult.id,
      });
    }

    return NextResponse.json({
      success: true,
      status,
      message: status === "waitlisted" ? "Zostałeś dodany do listy rezerwowej." : "Zapis potwierdzony.",
    });
  } catch (e) {
    console.error("[signup]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
