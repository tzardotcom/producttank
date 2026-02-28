# Tech Spec – ProductTank Event Management

**Ostatnia aktualizacja:** 2026-02-28

---

## 1. Stack

| Warstwa | Technologia |
|---------|-------------|
| Frontend | Next.js 14+ (App Router), TypeScript, shadcn/ui, Tailwind CSS |
| Backend | Supabase (Postgres, Auth, RLS) |
| Mail | Resend |
| Hosting | Vercel |
| Scheduler | Supabase pg_cron / Scheduled Functions (nie Vercel Cron) |
| Analityka | Reuse z Cabinly Gap Killer (ten sam provider, ten sam stos) |
| Antyspam | Cloudflare Turnstile na formularzu zapisu |

---

## 2. Struktura folderów (Next.js)

```
producttank/
├── app/
│   ├── layout.tsx              # Root layout, inicjalizacja analityki
│   ├── page.tsx                # Landing (public)
│   ├── globals.css
│   ├── (public)/
│   │   ├── event/[id]/page.tsx  # Strona eventu + formularz zapisu
│   │   └── feedback/[id]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout dashboardu (auth)
│   │   ├── page.tsx           # Lista eventów
│   │   ├── events/[id]/page.tsx
│   │   └── events/[id]/registrations/page.tsx
│   └── api/
│       ├── signup/route.ts     # POST zapis na event
│       ├── webhooks/           # Resend, Supabase (opcjonalnie)
│       └── ...
├── components/
│   ├── ui/                     # shadcn
│   ├── landing/
│   ├── signup-form/
│   └── dashboard/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── analytics/              # Reuse z Cabinly – konfig, wrapper, track()
│   ├── resend.ts
│   └── validations/
├── types/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── docs/
│   ├── TECH_SPEC.md
│   └── ANALYTICS_REUSE_CABINLY.md
└── ...
```

---

## 3. Modele danych (Supabase/Postgres) – multi-tenant

**Decyzja:** Multi-tenant od początku. Wszystkie dane dzierżawcy są izolowane po `organization_id`.

### 3.1 Tabele

**plans** (freemium)
- `id` (uuid, PK)
- `slug` (text, unique) – `'free'` | `'pro'`
- `name` (text, not null)
- `max_active_events_per_month` (int, nullable = unlimited)
- `max_attendees_per_event` (int, nullable = unlimited)
- `max_team_members` (int, nullable = unlimited)
- `features` (jsonb, opcjonalnie) – np. `{ "checkin": true, "feedback": true, "waitlist": true }` dla Pro
- `created_at`, `updated_at`

**organizations**
- `id` (uuid, PK)
- `name` (text, not null)
- `slug` (text, unique) – np. do subdomeny lub ścieżki `/org/producttank/`
- `plan_id` (FK → plans, not null, default = plan Free)
- `created_at`, `updated_at`

**organization_members** (powiązanie user ↔ organizacja)
- `id` (uuid, PK)
- `organization_id` (FK → organizations)
- `user_id` (uuid, FK → auth.users)
- `role` (enum: 'owner' | 'admin' | 'member')
- `created_at`
- UNIQUE(organization_id, user_id)

**people** (globalny rekord osoby – jedna osoba może mieć rejestracje w wielu organizacjach)
- `id` (uuid, PK)
- `email` (unique, not null)
- `name` (text)
- `created_at`, `updated_at`
- Bez `organization_id` – osoba jest współdzielona między organizacjami (rejestracje łączą przez event → org).

**events**
- `id` (uuid, PK)
- `organization_id` (FK → organizations, not null)
- `title`, `slug`, `description` (text)
- `starts_at`, `ends_at` (timestamptz)
- `max_attendees` (int, nullable)
- `drive_folder_id` (text, nullable)
- `created_at`, `updated_at`
- UNIQUE(organization_id, slug)

**event_registrations**
- `id` (uuid, PK)
- `event_id` (FK → events)
- `person_id` (FK → people)
- `status` (enum: 'registered' | 'waitlisted' | 'cancelled')
- `attended` (boolean, default false) – check-in
- `utm_source`, `utm_medium`, `utm_campaign` (text, nullable)
- `created_at`, `updated_at`
- UNIQUE(event_id, person_id)

**event_feedback**
- `id` (uuid, PK)
- `event_id` (FK → events)
- `person_id` (FK → people)
- `registration_id` (FK → event_registrations, nullable)
- `score` (int 1–5 lub scale)
- `comment` (text, nullable)
- `created_at`

**email_logs** (audit)
- `id` (uuid, PK)
- `organization_id` (FK → organizations, not null) – w której organizacji wysłano
- `person_id`, `event_id` (nullable)
- `template_key` (np. confirmation, reminder, follow_up)
- `sent_at`, `provider_id` (Resend)

**organization_subscriptions** (opcjonalnie, dla płatności Pro)
- `id` (uuid, PK)
- `organization_id` (FK → organizations, unique – jedna aktywna subskrypcja)
- `plan_id` (FK → plans)
- `status` (enum: `'active'` | `'past_due'` | `'canceled'` | `'trialing'`)
- `current_period_start`, `current_period_end` (timestamptz)
- `stripe_subscription_id` (text, nullable) – gdy integracja Stripe
- `created_at`, `updated_at`

*(Na MVP można trzymać tylko `organizations.plan_id`; tabela subscriptions przydatna przy Stripe i historii.)*

---

### 3.2 Freemium – limity i feature gating

- **Źródło planu:** `organizations.plan_id` (lub aktywna subskrypcja z `organization_subscriptions`).
- **Sprawdzanie limitów (API / RLS / app):**
  - **Eventy:** przed `INSERT` w `events` – liczba eventów organizacji z `starts_at` w bieżącym miesiącu kalendarzowym ≤ `plan.max_active_events_per_month` (null = brak limitu).
  - **Uczestnicy:** przed `INSERT` w `event_registrations` – liczba zapisów dla danego `event_id` < `plan.max_attendees_per_event` (null = brak limitu).
  - **Członkowie zespołu:** przed `INSERT` w `organization_members` – liczba członków org ≤ `plan.max_team_members`.
- **Feature gating (UI + API):** funkcje typu check-in, feedback, waitlist, checklisty, Drive – widoczne/wywoływalne tylko gdy `plan.features->>'<feature>' = 'true'` (lub osobna kolumna na planie). Zwracać 403 / komunikat „Dostępne w planie Pro” gdy brak uprawnienia.
- **Seed:** w migracji/seed utworzyć plany `free` i `pro` z limitami zgodnymi z PRD §7.

---

## 4. Endpointy / akcje

| Akcja | Metoda | Opis |
|-------|--------|------|
| Pobranie najbliższego eventu | GET | Dla landing: `events?status=upcoming&limit=1` (lub RPC) |
| Lista eventów (dashboard) | GET | Z RLS (organizacja) |
| Zapis na event | POST | `/api/signup` – walidacja, Turnstile, **limit planu** (max_attendees_per_event), tworzenie/aktualizacja `people` + `event_registrations` |
| Wysłanie potwierdzenia | Server / Edge | Po zapisie – Resend, wpis do `email_logs` |
| Check-in | PATCH | `event_registrations(id)` → `attended = true` |
| Lista zapisanych | GET | `event_registrations?event_id=...` z join do `people` |
| Export CSV | GET | Te same dane, response CSV |
| Feedback submit | POST | Zapis do `event_feedback`, opcjonalnie follow-up mail T+1 (scheduler); **tylko gdy plan ma feature feedback** |
| Tworzenie eventu | POST | Sprawdzenie limitu `max_active_events_per_month` dla organizacji |
| Upgrade / billing (Pro) | – | Opcjonalnie: Stripe Checkout, webhook – aktualizacja `organization_subscriptions` / `organizations.plan_id` |

---

## 5. RLS (Row Level Security) – multi-tenant

- Wszystkie tabele z włączonym RLS.
- **Kontekst organizacji:** zalogowany użytkownik ma dostęp tylko do danych organizacji, w których jest w `organization_members`. Pomocnicza funkcja: `auth.user_organization_ids()` (set organizacji użytkownika) lub `auth.organization_id()` (jedna aktualna org z JWT/session).

### 5.1 Public (anon)

- **events:** `SELECT` tylko gdzie `starts_at > now()` (lub jawna flaga `is_public`) – bez ujawniania `organization_id` w odpowiedzi jeśli nie trzeba; event dostępny po `id` lub `slug` (np. dla landingu).
- **event_registrations:** `INSERT` tylko dla `event_id` z eventu, który anon może odczytać; walidacja po stronie aplikacji (limit miejsc, Turnstile).
- **people:** `INSERT`, `SELECT` (własny rekord po email? lub tylko INSERT) – zgodnie z flow zapisu (tworzenie osoby przy pierwszej rejestracji).

### 5.2 Authenticated (member organizacji)

- **organizations:** `SELECT` tylko te, gdzie użytkownik jest w `organization_members`.
- **events:** `SELECT` / `INSERT` / `UPDATE` / `DELETE` tylko gdzie `organization_id IN (auth.user_organization_ids())`.
- **event_registrations:** dostęp przez join z `events` – tylko rejestracje do eventów swojej organizacji.
- **event_feedback:** tylko przez eventy swojej organizacji.
- **email_logs:** `SELECT` / `INSERT` tylko gdzie `organization_id IN (auth.user_organization_ids())`.
- **people:** `SELECT` tylko w kontekście rejestracji/feedbacku (przez eventy swojej org); nie usuwać cudzych osób.

---

## 6. Analityka

- Inicjalizacja w `app/layout.tsx` (lub root layout).
- Eventy i nazewnictwo: patrz `docs/ANALYTICS_REUSE_CABINLY.md`.
- **Nie** dodawać nowego providera (np. PostHog). Reuse konfiguracji i wrappera z Cabinly Gap Killer.

---

## 7. Scheduler (Supabase)

- **Reminder:** dzień przed eventem – query `event_registrations` gdzie `event.starts_at` ∈ [jutro], wysyłka maila, log w `email_logs`.
- **Follow-up:** T+1 po `event.ends_at` – wysyłka ankiety feedback, log w `email_logs`.

Implementacja: Supabase Edge Functions wywoływane przez pg_cron lub Scheduled Invocations (w zależności od wersji Supabase).

---

## 8. Multi-tenant (decyzja)

**Decyzja:** **Multi-tenant od początku.** Jedna baza, wiele organizacji (tenantów). Izolacja przez `organization_id` i RLS. Dzięki temu pierwszy tenant to np. ProductTank, kolejne – inne meetupy/klienci bez zmiany architektury.

### Kontekst organizacji w aplikacji

- **Public (landing, zapis):** event wybierany po `id` lub `slug`; zapytania do API ograniczone do tego eventu (bez ujawniania innych org).
- **Dashboard:** po logowaniu użytkownik wybiera organizację (lub ma jedną w `app_metadata`); wszystkie zapytania filtrowane po `organization_id`. Subdomena (`org-slug.producttank.app`) lub ścieżka (`/dashboard/org-slug/`) – do ustalenia w fazie Design.
