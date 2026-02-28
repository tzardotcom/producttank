/**
 * Analytics track – zgodnie z docs/ANALYTICS_REUSE_CABINLY.md
 * Eventy: landing_view, event_page_view, signup_started, signup_completed, feedback_submitted,
 * event_created, task_completed, checkin_marked, email_triggered
 */

export type AnalyticsEvent =
  | "landing_view"
  | "event_page_view"
  | "signup_started"
  | "signup_completed"
  | "feedback_submitted"
  | "event_created"
  | "task_completed"
  | "checkin_marked"
  | "email_triggered";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | undefined
> & {
  event_id?: string;
  person_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  source?: string;
  status?: string;
  task_key?: string;
  template_key?: string;
};

export function track(
  eventName: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  if (typeof window === "undefined") return;
  const payload = { event: eventName, properties: properties ?? {}, timestamp: new Date().toISOString() };
  // Gdy podłączysz provider z Cabinly – wywołaj tu np. window.analytics?.track(eventName, properties)
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", payload);
  }
  // Można wysłać do backendu lub zewnętrznego providera
  try {
    window.dispatchEvent(
      new CustomEvent("producttank:analytics", { detail: payload })
    );
  } catch {
    // ignore
  }
}
