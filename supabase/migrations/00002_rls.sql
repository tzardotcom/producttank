-- RLS: public.get_user_organization_ids() + policies per table

-- plans: readable by all (for limits/features)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_select_all" ON plans FOR SELECT TO anon, authenticated USING (true);

-- organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organizations_select_member"
  ON organizations FOR SELECT TO authenticated
  USING (id = ANY(public.get_user_organization_ids()));

-- organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organization_members_select_own_orgs"
  ON organization_members FOR SELECT TO authenticated
  USING (
    organization_id = ANY(public.get_user_organization_ids()) OR user_id = auth.uid()
  );
CREATE POLICY "organization_members_insert_org"
  ON organization_members FOR INSERT TO authenticated
  WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

-- people: anon can insert (signup), authenticated read only in context of their org's events
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "people_insert_anon" ON people FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "people_select_org"
  ON people FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM event_registrations er
      JOIN events e ON e.id = er.event_id
      WHERE er.person_id = people.id AND e.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- events: anon can read upcoming; authenticated full CRUD for their org
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_public_upcoming"
  ON events FOR SELECT TO anon USING (starts_at > now());
CREATE POLICY "events_select_org"
  ON events FOR SELECT TO authenticated
  USING (organization_id = ANY(public.get_user_organization_ids()));
CREATE POLICY "events_insert_org"
  ON events FOR INSERT TO authenticated
  WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));
CREATE POLICY "events_update_org"
  ON events FOR UPDATE TO authenticated
  USING (organization_id = ANY(public.get_user_organization_ids()));
CREATE POLICY "events_delete_org"
  ON events FOR DELETE TO authenticated
  USING (organization_id = ANY(public.get_user_organization_ids()));

-- event_registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_registrations_insert_anon"
  ON event_registrations FOR INSERT TO anon
  WITH CHECK (
    EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.starts_at > now())
  );
CREATE POLICY "event_registrations_select_org"
  ON event_registrations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_registrations.event_id AND e.organization_id = ANY(public.get_user_organization_ids())
    )
  );
CREATE POLICY "event_registrations_update_org"
  ON event_registrations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_registrations.event_id AND e.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- event_feedback
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_feedback_select_org"
  ON event_feedback FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_feedback.event_id AND e.organization_id = ANY(public.get_user_organization_ids())
    )
  );
CREATE POLICY "event_feedback_insert_anon"
  ON event_feedback FOR INSERT TO anon
  WITH CHECK (
    EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.ends_at < now())
  );

-- email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_logs_select_org"
  ON email_logs FOR SELECT TO authenticated
  USING (organization_id = ANY(public.get_user_organization_ids()));
CREATE POLICY "email_logs_insert_org"
  ON email_logs FOR INSERT TO authenticated
  WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));
