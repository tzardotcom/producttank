import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany").max(500),
  description: z.string().max(5000).optional().nullable(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime().optional(),
  max_attendees: z.number().int().min(1).max(10000).optional().nullable(),
  slug: z.string().min(1).max(200).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 200);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, description, starts_at, ends_at, max_attendees, slug: slugInput } = parsed.data;

  const { data: members } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1);

  const organizationId = members?.[0]?.organization_id;
  if (!organizationId) {
    return NextResponse.json(
      { error: "Nie należysz do żadnej organizacji. Skontaktuj się z administratorem." },
      { status: 403 }
    );
  }

  const baseSlug = slugInput ?? slugify(title);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const startsAt = new Date(starts_at);
  const endsAt = ends_at ? new Date(ends_at) : new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
  if (endsAt <= startsAt) {
    return NextResponse.json(
      { error: "Data zakończenia musi być po dacie rozpoczęcia." },
      { status: 400 }
    );
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      organization_id: organizationId,
      title,
      slug,
      description: description ?? null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      max_attendees: max_attendees ?? null,
    })
    .select("id, title, slug, starts_at")
    .single();

  if (error) {
    console.error("[api/events POST]", error);
    return NextResponse.json(
      { error: error.message ?? "Nie udało się utworzyć eventu." },
      { status: 500 }
    );
  }

  return NextResponse.json(event);
}
