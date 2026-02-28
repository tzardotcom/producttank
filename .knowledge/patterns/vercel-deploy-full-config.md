# Wzorzec: Deploy na Vercel z pełną konfiguracją

**Kiedy stosować:** Każdy projekt Next.js hostowany na Vercel (np. ProductTank, inne aplikacje agencji).

---

## Zasada

**Agent nie pomija kroku wdrożenia.** Po zbudowaniu MVP agent od razu:

1. Wystawia aplikację na Vercel (repo na GitHub + deploy).
2. Konfiguruje wszystko potrzebne do działania (env, integracje).

Nie zostawia użytkownikowi „ustaw sobie zmienne w Vercel” jako jedynej instrukcji – doprowadza do działającej strony w produkcji.

---

## Checklist (agent wykonuje)

### 1. Repo i deploy

- [ ] Kod w repozytorium GitHub (init + push lub połączenie z istniejącym).
- [ ] Projekt w Vercel połączony z repo (`vercel link` lub Import z dashboardu).
- [ ] Pierwszy deploy udany (`vercel --prod` lub deploy z dashboardu).

### 2. Zmienne środowiskowe na Vercel

Agent ustawia w projekcie Vercel **wszystkie** zmienne z `.env.example` potrzebne do działania:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (jeśli używane).
- **Resend / mail:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (jeśli używane).
- **Cron:** `CRON_SECRET` (jeśli są endpointy cron).
- **Aplikacja:** `NEXT_PUBLIC_APP_URL` (production URL), opcjonalnie `NEXT_PUBLIC_APP_NAME`.

**Skąd brać wartości:**

- Supabase: z projektu Supabase (Dashboard → Settings → API). Jeśli brak projektu – utworzyć (Supabase CLI lub dashboard) albo użyć istniejącego i udokumentować.
- Resend / CRON_SECRET: użytkownik może podać; jeśli nie – udokumentować w README / docs, które zmienne ustawić.

**Jeśli agent nie ma dostępu do credentials:** udokumentować w projekcie skrypt lub instrukcję (np. `scripts/set-vercel-supabase-env.sh`) i w bazie wiedzy wpisać, że „pełna konfiguracja” = deploy + ustawienie env przez użytkownika według tej instrukcji, a następnie redeploy.

### 3. Po ustawieniu env

- [ ] Redeploy (żeby build miał zmienne).
- [ ] Weryfikacja: strona ładuje się bez 500 (np. middleware nie wywala się przy braku env – patrz implementacja ProductTank).

### 4. Integracje z zewnętrznymi serwisami

- [ ] Supabase Auth: w projekcie Supabase (Authentication → URL Configuration) dodane Redirect URLs z production URL (np. `https://domena.vercel.app/**`).
- [ ] Ewentualne crony (Vercel Cron w `vercel.json`) – działają po deployu, gdy `CRON_SECRET` jest ustawione.

---

## Zależności

- **Middleware:** Jeśli aplikacja używa Supabase w middleware, musi obsłużyć brak env (np. `if (!url || !key) return NextResponse.next()`), żeby uniknąć 500 przed ustawieniem zmiennych.
- **Dokumentacja:** W README lub `docs/DEPLOY_VERCEL.md` – link do projektu Vercel, lista zmiennych, ewentualnie skrypt do ustawiania env (np. dla Supabase).

---

## Powiązane

- Implementacja: `.knowledge/implementations/deployment/vercel-producttank.md`
- Workflow agencji: `.agency/workflows/03_mvp_to_launch.md` (§ Vercel – deploy i konfiguracja)
- Projekt: `docs/DEPLOY_VERCEL.md`, `scripts/set-vercel-supabase-env.sh`
