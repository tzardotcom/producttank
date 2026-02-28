# Wystawianie na Vercel z GitHub

Deploy aplikacji ProductTank na Vercel z automatycznym buildem przy pushu do GitHub.

## 1. Repozytorium na GitHub

Jeśli projekt nie jest jeszcze na GitHubie:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TWOJ_USER/TWOJE_REPO.git
git push -u origin main
```

## 2. Połączenie z Vercel

1. Wejdź na [vercel.com](https://vercel.com) i zaloguj się (np. przez konto GitHub).
2. **Add New…** → **Project**.
3. **Import Git Repository** – wybierz repozytorium z listy (Vercel ma dostęp do Twoich repo przez integrację z GitHub).
4. Jeśli repo się nie pojawia: **Configure GitHub App** i nadaj Vercel dostęp do organizacji/repozytoriów.

## 3. Konfiguracja projektu w Vercel

| Pole | Wartość |
|------|---------|
| **Framework Preset** | Next.js (wykrywany automatycznie) |
| **Root Directory** | `.` (domyślnie) |
| **Build Command** | `npm run build` (domyślnie) |
| **Output Directory** | (puste – Next.js domyślnie) |
| **Install Command** | `npm install` (domyślnie) |

Kliknij **Deploy** – pierwszy build może się nie udać bez zmiennych środowiskowych. Przejdź do kroku 4.

## 4. Zmienne środowiskowe

W projekcie Vercel: **Settings** → **Environment Variables**. Dodaj dla **Production**, **Preview** i (opcjonalnie) **Development**:

| Nazwa | Wartość | Wymagane |
|-------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projektu Supabase (np. `https://xxx.supabase.co`) | Tak |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klucz anon (public) z Supabase → Settings → API | Tak |
| `SUPABASE_SERVICE_ROLE_KEY` | Klucz service_role z Supabase → Settings → API | Tak |
| `RESEND_API_KEY` | Klucz API z Resend (maile potwierdzenia) | Tak |
| `RESEND_FROM_EMAIL` | Adres nadawcy (zweryfikowany w Resend) | Zalecane |
| `NEXT_PUBLIC_APP_URL` | URL aplikacji na Vercel, np. `https://twoja-app.vercel.app` | Zalecane (auth redirect) |
| `NEXT_PUBLIC_APP_NAME` | Nazwa aplikacji (np. `ProductTank`) | Opcjonalne |

Po zapisaniu zmiennych uruchom ponowny deploy: **Deployments** → trzy kropki przy ostatnim deployu → **Redeploy**.

## 5. Supabase Auth (redirect URL)

Jeśli używasz logowania (dashboard):

1. W [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**.
2. W **Redirect URLs** dodaj:
   - `https://twoja-app.vercel.app/**`
   - `https://*.vercel.app/**` (dla preview deployments).

## 6. Automatyczne deploye

- **Push na `main`** → deploy do **Production**.
- **Push na inne branchy** lub **Pull Request** → deploy **Preview** (osobny URL).

Preview dostaje te same zmienne co Production, chyba że w Vercel ustawisz inne dla Environment = Preview.

## 7. Weryfikacja

- Production: `https://twoja-app.vercel.app`
- Landing: `/`
- Logowanie: `/login`
- Panel: `/dashboard` (po zalogowaniu)

Upewnij się, że w Supabase są wykonane migracje i seed (lub zdalny projekt z `npm run db:push` + seed w SQL Editor).

## 8. Vercel CLI (opcjonalnie)

```bash
npm i -g vercel
vercel login
vercel link          # powiąż folder z projektem Vercel
vercel env pull .env.local   # ściągnij zmienne do pliku
vercel --prod       # deploy na production
```

Skrypty w `package.json`: `vercel` (preview), `vercel --prod` (production).
