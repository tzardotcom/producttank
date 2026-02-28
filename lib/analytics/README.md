# Analytics – Reuse z Cabinly (Gap Killer)

**Tu wklej skopiowaną warstwę analityki z projektu Cabinly – Gap Killer.**

## Co skopiować

- Konfigurację klienta analityki → np. `client.ts` lub `config.ts`
- Wrapper / util do trackowania → np. `track.ts` z funkcją `track(eventName, properties)`
- Inicjalizację w root layout (w Cabinly) → powtórz w `app/layout.tsx`
- Mapowanie env (te same zmienne co w Cabinly)

## Eventy do wywołań w ProductTank

Po skopiowaniu używaj tych nazw eventów (zgodnie z PRD):

**Public:**  
`landing_view` | `event_page_view` | `signup_started` | `signup_completed` | `feedback_submitted`

**Admin:**  
`event_created` | `task_completed` | `checkin_marked` | `email_triggered`

Szczegóły payloadów i konwencja: `docs/ANALYTICS_REUSE_CABINLY.md`.
