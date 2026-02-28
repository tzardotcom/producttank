# ProductTank – Event Management System

Aplikacja w modelu **freemium** do zarządzania cyklem życia eventów: zapisy, uczestnicy, retencja, feedback, automatyzacja komunikacji i centralizacja plików. Zastępuje Tally i rozproszone narzędzia. Plan Free + plan Pro.

**Stack:** Next.js (App Router), TypeScript, shadcn/ui, Tailwind, Supabase, Resend, Vercel.

Projekt zarządzany przez MVP Software House Agency. Zobacz [.agency/START_HERE.md](.agency/START_HERE.md).

## Szybki start (CLI)

Pełna instrukcja: **[docs/SETUP_CLI.md](docs/SETUP_CLI.md)**.

```bash
npm run setup                    # install + .env.local z .env.example
npm run db:start                 # Supabase lokalnie (Docker)
npm run db:reset                 # migracje + seed (plany Free/Pro)
npm run dev                      # Next.js
```

Uzupełnij `.env.local` (Supabase URL, anon key, service_role key, Resend).  
Landing: http://localhost:3000 · Panel: http://localhost:3000/dashboard · Logowanie: http://localhost:3000/login  

**Zdalny projekt (Supabase Cloud):** `npm run supabase:login` → `npm run supabase:link` → `npm run db:push`, potem seed ręcznie w Dashboard (SQL Editor).

## Deploy na Vercel (z GitHub)

Połącz repozytorium GitHub z Vercel – każdy push na `main` zbuduje i wdroży aplikację.  
Instrukcja krok po kroku: **[docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)** (Import z GitHub, zmienne środowiskowe, Supabase redirect URLs).

## Iteracja 2 (wdrożona)

- **Check-in** (plan Pro) – przycisk „Oznacz obecność” przy zapisanych w dashboardzie.
- **Feedback** – ankieta po evencie: `/feedback/[eventId]` (email + ocena 1–5 + komentarz).
- **Reminder** – job `GET /api/jobs/send-reminders` (maile dzień przed eventem); cron: `docs/CRON_JOBS.md`.
- **Follow-up** – job `GET /api/jobs/send-feedback-followup` (maile T+1 z linkiem do ankiety).
- **Retencja** – `/dashboard/retention`: zapisani, obecni, show-up rate, śr. ocena, repeat attendees (plan Pro).

## Dokumentacja

- **Wizja i PRD:** `.agency/VISION_MISSION.md`, `.agency/PRD.md`
- **Tech Spec:** `docs/TECH_SPEC.md`
- **Cron (reminder, follow-up):** `docs/CRON_JOBS.md`
- **Analityka:** reużycie warstwy z Cabinly (Gap Killer) – ten sam stos, bez PostHog.
