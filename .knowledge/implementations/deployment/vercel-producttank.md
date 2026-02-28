# Deployment: Vercel (ProductTank)

**Data:** 2026-02-28  
**Projekt:** ProductTank

---

## Co zbudowaliśmy

- Repo GitHub + połączenie z Vercel (`vercel link`), deploy production (`vercel --prod`).
- Konfiguracja: `vercel.json` (cron: reminder 9:00 UTC, follow-up 10:00 UTC).
- Zmienne środowiskowe: wymagane na Vercel (Supabase, Resend, CRON_SECRET, NEXT_PUBLIC_APP_URL) – agent nie pomija tego kroku; jeśli nie ma credentials, dostarcza skrypt/instrukcję i dopisuje do bazy wiedzy.

## Technologia

- Vercel (hosting Next.js)
- Vercel CLI: `vercel link`, `vercel env add`, `vercel --prod`
- GitHub jako source; automatyczne deploye przy pushu na `main`

## Kluczowe pliki

- `vercel.json` – definicja cronów
- `docs/DEPLOY_VERCEL.md` – instrukcja deployu i zmiennych
- `scripts/set-vercel-supabase-env.sh` – ustawianie env Supabase na Vercel (gdy użytkownik ma URL i klucz)
- `lib/supabase/middleware.ts` – obsługa braku env (brak 500 gdy zmienne nie ustawione)

## Dlaczego ten wybór

- Next.js na Vercel = zero config, dobre DX.
- Cron w `vercel.json` + CRON_SECRET w env = reminder i follow-up bez zewnętrznego crona.
- Middleware odporny na brak env – strona się ładuje, dopiero po ustawieniu zmiennych działa auth/Supabase.

## Problemy i rozwiązania

- **Problem:** 500 MIDDLEWARE_INVOCATION_FAILED po pierwszym deployu – brak env Supabase na Vercel.
- **Rozwiązanie:** W middleware: jeśli brak `NEXT_PUBLIC_SUPABASE_URL` lub `NEXT_PUBLIC_SUPABASE_ANON_KEY`, zwracać `NextResponse.next()`; opakować wywołanie Supabase w try/catch.

- **Problem:** Agent nie ustawił env na Vercel (brak dostępu do Supabase credentials).
- **Rozwiązanie:** Wpis do bazy wiedzy: wzorzec „Vercel deploy z pełną konfiguracją” + checklist w workflow 03. Agent ma od razu wystawiać aplikację i konfigurować wszystko; jeśli nie ma credentials – skrypt + jasna instrukcja i dopisanie do wiedzy, żeby kolejnym razem nie pomijać kroku.

## Reużywalność

✅ Wysoka – ten sam flow (repo → Vercel link → env → redeploy) i wzorzec w `.knowledge/patterns/vercel-deploy-full-config.md` dla każdego Next.js na Vercel.
