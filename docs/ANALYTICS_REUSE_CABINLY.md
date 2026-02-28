# Analityka – Reuse z Cabinly (Gap Killer)

**Zasada:** Nie używamy PostHog ani żadnego nowego narzędzia. Kopiujemy w całości implementację analityki z projektu **Cabinly – Gap Killer**.

---

## 1. Co skopiować z Cabinly

1. **Konfiguracja klienta analityki** – plik/ moduł inicjalizujący klienta (np. w `lib/analytics/` lub równoległej ścieżce).
2. **Wrapper / util do trackowania** – np. `track(eventName, properties)` używany w aplikacji.
3. **Sposób inicjalizacji** – gdzie i jak klient jest inicjowany (np. w root layout / app root), żeby był dostępny w całej aplikacji.
4. **Mapowanie zmiennych środowiskowych** – np. `NEXT_PUBLIC_ANALYTICS_*` lub odpowiednik z Cabinly; skopiować nazwy i użycie.
5. **Struktura event naming** – konwencja (snake_case, prefiksy) taka jak w Cabinly; poniżej mapowanie na domenę ProductTank.

---

## 2. Konwencja nazw eventów (zgodna z PRD)

Utrzymać spójność z Cabinly, dostosować nazwy do domeny event management:

| Event (ProductTank)   | Kiedy                     | Właściwości (sugerowane)                    |
|-----------------------|---------------------------|---------------------------------------------|
| `landing_view`        | Wejście na landing        | `utm_source`, `utm_medium`, `utm_campaign`  |
| `event_page_view`     | Wejście na stronę eventu  | `event_id`, `event_slug`, utm               |
| `signup_started`      | Start formularza zapisu   | `event_id`, utm                             |
| `signup_completed`    | Zapis zakończony          | `event_id`, `person_id`, `status` (registered/waitlisted) |
| `feedback_submitted`  | Wysłanie feedbacku        | `event_id`, `person_id`                     |
| `event_created`       | Admin: utworzenie eventu  | `event_id`                                  |
| `task_completed`      | Admin: odhaczenie taska   | `event_id`, `task_key`                      |
| `checkin_marked`      | Admin: check-in           | `event_id`, `person_id`, `registration_id`  |
| `email_triggered`     | Wysłanie maila            | `template_key`, `event_id`, `person_id`     |

---

## 3. Właściwości payloadów (wspólne)

- `event_id` (uuid)
- `person_id` (uuid, gdy znane)
- `utm_source`, `utm_medium`, `utm_campaign`
- `source` (np. `landing`, `dashboard`)
- Timestamp zwykle dodaje sam klient/sdk.

---

## 4. Miejsce w kodzie ProductTank

- **Inicjalizacja:** `app/layout.tsx` (lub główny layout) – tak jak w Cabinly.
- **Wywołania:** `lib/analytics/track.ts` (lub odpowiednik) – po skopiowaniu wrappera z Cabinly.
- **Env:** te same nazwy zmiennych co w Cabinly (skopiować z `.env.example` Cabinly).

---

## 5. Czego nie robić

- Nie dodawać PostHog.
- Nie dodawać innego providera analityki.
- Nie zmieniać providera względem Cabinly – ten sam stos.

---

*Po skopiowaniu implementacji z Cabinly zaktualizować ten plik o ścieżki plików i ewentualne różnice (np. tylko nazwy eventów).*
