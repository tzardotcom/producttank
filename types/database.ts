export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Plan {
  id: string;
  slug: string;
  name: string;
  max_active_events_per_month: number | null;
  max_attendees_per_event: number | null;
  max_team_members: number | null;
  features: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  max_attendees: number | null;
  drive_folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export type RegistrationStatus = "registered" | "waitlisted" | "cancelled";

export interface EventRegistration {
  id: string;
  event_id: string;
  person_id: string;
  status: RegistrationStatus;
  attended: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationWithPerson extends EventRegistration {
  people: Person | null;
}
