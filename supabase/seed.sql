-- Seed plans (freemium) + default org for development

INSERT INTO plans (id, slug, name, max_active_events_per_month, max_attendees_per_event, max_team_members, features, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111101'::uuid, 'free', 'Free', 2, 50, 1, '{"checkin": false, "feedback": false, "waitlist": false}', now()),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'pro', 'Pro', NULL, NULL, NULL, '{"checkin": true, "feedback": true, "waitlist": true, "retention": true}', now())
ON CONFLICT (slug) DO NOTHING;

-- Optional: one default org (ProductTank) – uncomment and set plan_id to free plan if you want seed org
-- INSERT INTO organizations (id, name, slug, plan_id)
-- VALUES ('22222222-2222-2222-2222-222222222201'::uuid, 'ProductTank', 'producttank', '11111111-1111-1111-1111-111111111101'::uuid)
-- ON CONFLICT (slug) DO NOTHING;
