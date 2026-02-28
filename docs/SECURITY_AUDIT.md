# Raport testów bezpieczeństwa – ProductTank

**Data:** 2025-02-28  
**Zakres:** repozytorium GitHub, zmienne środowiskowe, zależności, endpointy API.

---

## 1. Wycieki w repozytorium (GitHub)

### ✅ Brak wrażliwych danych w repo

- **Pliki `.env`:** W repozytorium śledzony jest **tylko** `.env.example` z placeholderami (`your-anon-key`, `re_xxxx`, `your-cron-secret`). Prawdziwe pliki `.env`, `.env.local`, `.env.production.local` są w `.gitignore` i **nie są commitowane**.
- **Hasła / klucze API:** Nie znaleziono w kodzie żadnych prawdziwych kluczy (Supabase, Resend, JWT, AWS, Stripe itp.).
- **Dokumentacja:** W `docs/CRON_JOBS.md` występuje wyłącznie przykład `CRON_SECRET=dowolny-tajny-ciag` (opis, nie prawdziwy secret).

**Rekomendacja:** Przed commitem uruchom `npm run security-check` (sprawdza, czy w stagingu nie ma `.env` / `.env.local`). W Vercel ustaw wszystkie zmienne w Environment Variables, nie w plikach.

---

## 2. Zmienne środowiskowe i ich użycie

| Zmienna | Użycie | Ryzyko |
|--------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klient Supabase (publiczne z założenia) | OK – anon key jest do użytku po stronie klienta; RLS chroni dane |
| `SUPABASE_SERVICE_ROLE_KEY` | Tylko server-side (`lib/supabase/admin.ts`, joby cron) | OK – nie trafia do klienta |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Tylko server-side (`lib/resend.ts`) | OK |
| `CRON_SECRET` | Weryfikacja nagłówka `Authorization: Bearer` w `/api/jobs/*` | W produkcji **musi** być ustawione (patrz §4) |

---

## 3. Zależności (npm audit)

```
4 vulnerabilities (3 high, 1 critical)
- next: luki (m.in. DoS, cache poisoning, middleware bypass) – fix: upgrade do 14.2.35+
- eslint-config-next → glob: command injection w glob CLI
```

**Rekomendacja:**

- `npm audit fix` (bez `--force`) – sprawdź, czy usuwa część problemów bez łamania wersji.
- Upgrade Next.js do wersji z poprawkami (np. 14.2.35 w ramach 14.x) i ponowne `npm audit`.
- `npm audit fix --force` zmienia wersje (np. Next 16) – tylko po przetestowaniu aplikacji.

**Zaimplementowano (2025-02-28):**

- Next.js i `eslint-config-next` uaktualnione do **14.2.35** (poprawki bezpieczeństwa w 14.x).
- W `package.json` dodany **override** `glob: ^10.5.0` – usuwa podatność GHSA-5j98-mcp5-4vw2 (command injection w glob CLI) z łańcucha zależności eslint-config-next.
- Po tych zmianach: **1 high** (Next.js – DoS Image Optimizer / RSC; pełna poprawka wymaga Next 16 – breaking change).
- Skrypt **`npm run security-check`** – sprawdza, czy w `git diff --cached` nie ma plików `.env` / `.env.local`; zalecane przed `git commit` (np. w pre-commit lub ręcznie).

---

## 4. Endpointy API i autoryzacja

- **`/api/signup`:** Walidacja Zod, Supabase z parametrami (.eq, .insert) – brak raw SQL. Limit miejsc i plany – OK.
- **`/api/feedback`:** Zod + Supabase client (RLS). Tylko zapis po zakończonym evencie i weryfikacja osoby – OK.
- **`/api/events/[id]/registrations/csv`:** Używa `createClient()` (sesja użytkownika) – RLS ogranicza dane do organizacji użytkownika – OK.
- **`/api/jobs/send-reminders` i `/api/jobs/send-feedback-followup`:**  
  Gdy `CRON_SECRET` **nie** jest ustawione, endpointy przyjmują wywołania **bez autoryzacji** (cel: testy lokalne).  
  **Ryzyko:** Na Vercel, jeśli ktoś zapomni ustawić `CRON_SECRET`, każdy może wywołać GET i rozesłać maile.

**Rekomendacja (zastosowana w kodzie):** W produkcji (np. gdy `VERCEL` lub `NODE_ENV=production`) wymagać `CRON_SECRET` i zwracać 401, gdy brak nagłówka lub niezgodny secret.

---

## 5. Baza danych i RLS

- W migracjach włączone jest RLS na tabelach (organizations, events, event_registrations, people itd.).
- Dostęp anon: tylko nadchodzące eventy i zapisy (INSERT) w dopuszczalnym zakresie.
- Zalogowani: tylko dane organizacji z `get_user_organization_ids()`.

Brak bezpośredniego raw SQL z wejścia użytkownika – zapytania przez Supabase client z parametrami.

---

## 6. Podsumowanie

| Obszar | Status | Uwagi |
|--------|--------|--------|
| Sekrety w repo | ✅ | Tylko `.env.example` z placeholderami |
| .gitignore dla .env | ✅ | .env, .env.local, .env*.local wykluczone |
| Użycie env w kodzie | ✅ | Sekrety tylko po stronie serwera |
| Cron bez auth w prod | ⚠️→✅ | Wymuszony CRON_SECRET w produkcji (patch w kodzie) |
| Zależności | ⚠️→✅ | Next 14.2.35 + override glob; 1 high pozostaje (fix w Next 16) |
| SQL injection | ✅ | Brak raw SQL z inputu; RLS włączone |
| Autoryzacja API | ✅ | Dashboard/CSV przez sesję; cron przez Bearer |

---

**Wnioski:** W repozytorium na GitHub nic nie wycieka publicznie. Należy ustawić `CRON_SECRET` na Vercel. Zależności zaktualizowane (Next 14.2.35, override glob); przed commitem warto uruchomić `npm run security-check`.
