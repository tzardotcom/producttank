# Konfiguracja przez CLI (Supabase)

Wszystkie kroki bazy danych i projektu można wykonać z terminala.

## Wymagania

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://docs.docker.com/get-docker/) (dla lokalnego Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli) – używamy przez `npx`, nie trzeba instalować globalnie

## 1. Instalacja i zmienne środowiskowe

```bash
npm run setup
```

Skopiuje `.env.example` → `.env.local` (jeśli brak). Uzupełnij w `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (do API signup i email_logs)
- `RESEND_API_KEY` (maile potwierdzenia)

## 2. Baza lokalna (Docker)

```bash
# Uruchom Supabase lokalnie (Postgres, Auth, Studio itd.)
npm run db:start

# Zastosuj migracje i seed (plany Free/Pro)
npm run db:reset
```

Po `db:start` w terminalu zobaczysz adresy, m.in.:

- **API URL** – wklej do `.env.local` jako `NEXT_PUBLIC_SUPABASE_URL`
- **anon key** – `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** – `SUPABASE_SERVICE_ROLE_KEY`
- **Studio** – np. http://localhost:54323 (tabele, SQL, Auth)

Lokalny adres API to zwykle `http://127.0.0.1:54321` (albo inny port z wyświetlonego podsumowania).

Zatrzymanie:

```bash
npm run db:stop
```

## 3. Zdalny projekt (Supabase Cloud)

Jeśli masz projekt w [Supabase Dashboard](https://supabase.com/dashboard):

```bash
# Zaloguj się (otworzy przeglądarkę)
npm run supabase:login

# Powiąż folder z projektem (wybierz projekt z listy)
npm run supabase:link

# Wyślij migracje na zdalną bazę
npm run db:push
```

Seed (plany Free/Pro) uruchom ręcznie w Dashboard → SQL Editor: wklej zawartość `supabase/seed.sql` i wykonaj.

## 4. Skrypty npm

| Skrypt            | Opis                                      |
|-------------------|-------------------------------------------|
| `npm run setup`   | `npm install` + kopiowanie `.env.example` |
| `npm run db:start`| Uruchom lokalny Supabase (Docker)          |
| `npm run db:stop` | Zatrzymaj lokalny Supabase                |
| `npm run db:reset`| Reset lokalnej bazy + migracje + seed     |
| `npm run db:push` | Wyślij migracje na linked projekt          |
| `npm run db:diff` | Wygeneruj migrację z diffu schematu       |
| `npm run supabase:login` | Logowanie do Supabase CLI           |
| `npm run supabase:link`  | Powiązanie z projektem w chmurze     |

## 5. Pierwsza organizacja i event (po db:reset / db:push)

1. W Supabase Studio (lub SQL Editor) dodaj organizację:
   - Wejdź w tabelę `plans` i skopiuj `id` planu o `slug = 'free'`.
   - W tabeli `organizations` wstaw wiersz: `name`, `slug`, `plan_id` (id planu free).

2. Użytkownik (Auth):
   - Lokalnie: w Studio → Authentication → Users utwórz użytkownika (email/hasło).
   - Skopiuj UUID użytkownika.

3. W tabeli `organization_members` wstaw: `organization_id`, `user_id` (UUID z kroku 2), `role = 'owner'`.

4. W tabeli `events` wstaw event: `organization_id`, `title`, `slug`, `starts_at`, `ends_at` (np. przyszła data).

5. Uruchom app: `npm run dev` i wejdź na http://localhost:3000 (landing) oraz http://localhost:3000/login (panel).

## 6. Nowe migracje

```bash
# Po zmianie schematu lokalnie – wygeneruj plik migracji
npm run db:diff
```

Nowy plik pojawi się w `supabase/migrations/`. Zatwierdź go i użyj `db:reset` (lokalnie) lub `db:push` (zdalny projekt).
