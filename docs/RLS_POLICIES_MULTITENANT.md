# RLS Policies – multi-tenant (Supabase)

Poniżej szkielet polityk RLS. W migracjach użyj pomocniczej funkcji zwracającej organizacje użytkownika (np. przez `auth.jwt() -> app_metadata` lub join z `organization_members`).

---

## Pomocnicza funkcja (organization context)

```sql
-- Zwraca tablicę organization_id, do których należy zalogowany użytkownik
CREATE OR REPLACE FUNCTION auth.user_organization_ids()
RETURNS uuid[] AS $$
  SELECT COALESCE(
    array_agg(organization_id),
    '{}'
  )
  FROM organization_members
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

Opcja: zamiast tablicy, jedna „aktualna” organizacja z JWT (`app_metadata.organization_id`) – wtedy jedna funkcja `auth.current_organization_id()`.

---

## organizations

- **SELECT:** użytkownik może czytać tylko organizacje, w których jest członkiem.

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_select_member"
ON organizations FOR SELECT
TO authenticated
USING (id = ANY(auth.user_organization_ids()));
```

---

## organization_members

- **SELECT:** tylko wiersze dla organizacji, w których użytkownik jest członkiem (lub własny wiersz).

```sql
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organization_members_select_own_orgs"
ON organization_members FOR SELECT
TO authenticated
USING (
  organization_id = ANY(auth.user_organization_ids())
  OR user_id = auth.uid()
);
```

---

## events

- **anon SELECT:** tylko eventy „nadchodzące” (np. `starts_at > now()`), jeśli chcesz publiczny landing bez logowania. Opcjonalnie: tylko eventy z flagą `is_public = true`.
- **authenticated SELECT/INSERT/UPDATE/DELETE:** tylko dla `organization_id IN (auth.user_organization_ids())`.

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public: odczyt nadchodzących eventów (np. po id/slug w API)
CREATE POLICY "events_select_public_upcoming"
ON events FOR SELECT
TO anon
USING (starts_at > now());

-- Authenticated: pełny dostęp w ramach swoich organizacji
CREATE POLICY "events_select_org"
ON events FOR SELECT
TO authenticated
USING (organization_id = ANY(auth.user_organization_ids()));

CREATE POLICY "events_insert_org"
ON events FOR INSERT
TO authenticated
WITH CHECK (organization_id = ANY(auth.user_organization_ids()));

CREATE POLICY "events_update_org"
ON events FOR UPDATE
TO authenticated
USING (organization_id = ANY(auth.user_organization_ids()));

CREATE POLICY "events_delete_org"
ON events FOR DELETE
TO authenticated
USING (organization_id = ANY(auth.user_organization_ids()));
```

---

## event_registrations

- **anon INSERT:** dozwolone tylko dla eventów, które anon może odczytać (np. `event_id IN (SELECT id FROM events WHERE starts_at > now())`). W praktyce lepiej: API sprawdza limit miejsc i walidację, RLS tylko blokuje wstawianie do eventów z innych org / przeszłych.
- **authenticated SELECT/UPDATE:** tylko rejestracje do eventów swojej organizacji (przez join z `events`).

```sql
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Anon: wstawianie rejestracji tylko do „publicznego” eventu (np. nadchodzącego)
CREATE POLICY "event_registrations_insert_anon"
ON event_registrations FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_id AND e.starts_at > now()
  )
);

-- Authenticated: odczyt tylko przez eventy swojej org
CREATE POLICY "event_registrations_select_org"
ON event_registrations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_registrations.event_id
    AND e.organization_id = ANY(auth.user_organization_ids())
  )
);

CREATE POLICY "event_registrations_update_org"
ON event_registrations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_registrations.event_id
    AND e.organization_id = ANY(auth.user_organization_ids())
  )
);
```

---

## people

- **anon INSERT:** dozwolone (tworzenie osoby przy zapisie).
- **anon SELECT:** ograniczone: tylko w kontekście własnej rejestracji (np. po email w session) – trudno w czystym RLS; często people jest wstawiane/odczytywane tylko z backendu/Edge. Dla uproszczenia: **SELECT dla anon:** brak (tylko API zwraca to, co trzeba) lub bardzo restrykcyjny warunek.
- **authenticated SELECT:** tylko gdy osoba występuje w rejestracjach do eventów swojej org (np. przez EXISTS do event_registrations + events).

```sql
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "people_insert_anon"
ON people FOR INSERT
TO anon
WITH CHECK (true);

-- Authenticated: odczyt osób powiązanych z eventami swojej org
CREATE POLICY "people_select_org"
ON people FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_registrations er
    JOIN events e ON e.id = er.event_id
    WHERE er.person_id = people.id
    AND e.organization_id = ANY(auth.user_organization_ids())
  )
);
```

---

## event_feedback

- **anon INSERT:** tylko dla eventów nadchodzących/zakończonych, do których osoba jest zapisana (opcjonalnie; w praktyce często przez API z tokenem).
- **authenticated SELECT/INSERT:** tylko dla eventów swojej organizacji.

```sql
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_feedback_select_org"
ON event_feedback FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_feedback.event_id
    AND e.organization_id = ANY(auth.user_organization_ids())
  )
);

CREATE POLICY "event_feedback_insert_anon"
ON event_feedback FOR INSERT
TO anon
WITH CHECK (
  EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.ends_at < now())
);
```

---

## email_logs

- **authenticated SELECT/INSERT:** tylko dla `organization_id IN (auth.user_organization_ids())`. Anon bez dostępu.

```sql
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_logs_select_org"
ON email_logs FOR SELECT
TO authenticated
USING (organization_id = ANY(auth.user_organization_ids()));

CREATE POLICY "email_logs_insert_org"
ON email_logs FOR INSERT
TO authenticated
WITH CHECK (organization_id = ANY(auth.user_organization_ids()));
```

---

Przy implementacji: dostosuj warunki (np. `starts_at > now()`) do swoich reguł „publicznego” eventu i ewentualnie dodaj `is_public` na `events`.
