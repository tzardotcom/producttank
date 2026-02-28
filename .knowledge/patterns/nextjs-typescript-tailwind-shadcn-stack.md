# Stack technologiczny: Next.js 14, TypeScript, Tailwind, shadcn/ui

Wzorzec wiedzy dla projektów opartych o App Router, TypeScript, Tailwind CSS i komponenty w stylu shadcn. Dokument dla agentów i zespołu – definicje pojęć, relacje między elementami, praktyki.

---

## 1. Elementy stosu – od podstaw

### Next.js 14 (App Router)

**Next.js** to framework do aplikacji Reactowych. Rozszerza React o:

- **Routing (adresy URL → strony)**  
  Adres w przeglądarce (np. `/dashboard`) mapuje się na pliki w `app/`. Nie definiujesz ręcznie „jeśli URL = X, pokaż Y” – Next.js robi to na podstawie struktury folderów.

- **SSR (Server-Side Rendering)**  
  HTML strony jest generowany na serwerze przy każdym żądaniu. Dobre do treści zależnych od użytkownika, SEO i „świeżych” danych.

- **Statyczne strony (SSG)**  
  HTML generowany raz przy buildzie. Szybkie, cache’owane – np. landing, blog.

- **API routes**  
  W tym samym projekcie możesz mieć endpointy `/api/users`, `/api/products` – to backend (Node.js), nie tylko frontend.

- **Optymalizacja**  
  Next.js optymalizuje obrazy (`next/image`), fonty (`next/font`), bundling – szybsze ładowanie.

**App Router** (od wersji 13):

- Routing oparty o **strukturę folderów** w `app/`.
- `app/page.tsx` → strona `/`.
- `app/dashboard/page.tsx` → `/dashboard`.
- `app/blog/[slug]/page.tsx` → trasy dynamiczne, np. `/blog/hello-world`.
- W folderze trasy: `page.tsx` (treść), `layout.tsx` (wspólny layout), `loading.tsx`, `error.tsx`.

### React (biblioteka do interfejsu)

- **Komponenty** – fragmenty UI (np. `<Button>`, `<Card>`), łączone w większe strony.
- **Stan (state)** – dane zmieniające się w czasie (wartość inputa, lista). Przy zmianie stanu React przerysowuje tylko to, co trzeba.
- **JSX** – składnia w `.tsx`/`.jsx`: wygląda jak HTML w JavaScript; w rzeczywistości to wywołania funkcji React.

### TypeScript

- **Typy** – opisujesz kształt danych (`string`, `number`, `User`, `ButtonProps`).
- **Sprawdzanie typów** – błędy (literówki, złe argumenty) widać w edytorze i przy buildzie, zanim uruchomisz kod.
- **Autouzupełnianie** – edytor wie, jakie właściwości ma obiekt i jakie metody ma funkcja.

### Tailwind CSS

- **Utility-first** – zamiast własnych klas piszesz gotowe klasy w JSX.
- Przykłady: `p-4`, `text-red-500`, `flex items-center`, `md:flex`, `dark:bg-gray-900`.
- **Design tokens** – kolory, odstępy, fonty w `tailwind.config` – spójny wygląd aplikacji.

### Komponenty w stylu shadcn (Button, Input, Card, Label)

**shadcn/ui** to zestaw komponentów, których **kod kopiujesz do projektu** (np. `components/ui/`), a nie instalujesz jako zależność. Styl: Tailwind + często Radix UI (a11y, zachowanie).

- **Button** – przycisk, warianty (default, outline, ghost, destructive), rozmiary.
- **Input** – pole tekstowe, spójny styl z resztą UI.
- **Card** – `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` – bloki treści.
- **Label** – etykieta do pól formularza, powiązana z inputem (`htmlFor` + `id`).

---

## 2. Design tokens z Figmy do Tailwind

**Tak** – tokeny z Figmy (kolory, spacing, typography) można przenieść do `tailwind.config`.

- W Figma: Variables / Style (kolory, typography, spacing).
- W projekcie: w `tailwind.config.ts` rozszerzasz `theme.extend`:

```ts
theme: {
  extend: {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
    },
    spacing: {
      '18': '4.5rem',
    },
  },
}
```

Można to robić ręcznie lub narzędziami (Figma to Code, Style Dictionary, pluginy eksportujące JSON). Tokeny z Figmy → plik konfiguracyjny → `tailwind.config`.

---

## 3. Komponenty (React) vs typy (TypeScript)

| | Komponenty (React) | Typy (TypeScript) |
|---|-------------------|-------------------|
| **Co to** | Fragmenty **interfejsu** – przyciski, karty, formularze. To, co użytkownik **widzi**. | Opisy **kształtu danych** – string, number, obiekt z polami X, Y. Nie renderują się. |
| **Gdzie** | Pliki `.tsx`, zwracają JSX. | `interface`, `type` w `.ts`/`.tsx` – dla kompilatora i IDE. |
| **Przykład** | `<Button>Zapisz</Button>` | `type User = { name: string; id: number }` |

**Relacja:** komponenty **używają** typów (np. `Button` ma `ButtonProps`). Typy opisują „co można przekazać”, komponenty – „co się wyświetli”.

---

## 4. TypeScript vs shadcn

- **TypeScript** – **język**. Rozszerza JavaScript o typy. Nie dotyczy wyglądu ani gotowych przycisków.
- **shadcn** – **zestaw komponentów UI**. Gotowe elementy (Button, Input, Card, Label). Napisane w TypeScript, stylowane Tailwindem.

**TypeScript = język; shadcn = gotowe komponenty UI.** shadcn korzysta z TypeScript (typowane props), ale to nie to samo.

---

## 5. Relacje między elementami

```
NEXT.JS 14 (App Router)
  – struktura aplikacji (app/, routing)
  – SSR, API routes, optymalizacja
         │
         ├── REACT (komponenty, stan, JSX)
         ├── TYPESCRIPT (typy, props, API)
         └── TAILWIND (style, klasy)
                    │
                    └── Komponenty UI (shadcn)
                        – React + TypeScript + Tailwind
                        – Button, Input, Card, Label
```

- **Next.js** – szkielet aplikacji (routing, strony, API).
- **React** – model UI; Next.js go „opakowuje”.
- **TypeScript** – opisuje dane i API w całym projekcie, w tym props komponentów.
- **Tailwind** – nadaje wygląd (kolory, odstępy, layout).
- **shadcn (Button, Input, Card, Label)** – gotowe klocki: React + typowane props + Tailwind; używane na stronach w Next.js (np. w `app/.../page.tsx` lub `components/`).

---

## 6. Dla agentów

- Przy **wyborze stacku** dla nowego projektu: ten wzorzec opisuje typowy zestaw (Next.js 14 App Router + TypeScript + Tailwind + shadcn).
- Przy **implementacji UI**: używać komponentów z `components/ui/` (Button, Input, Card, Label), stylować Tailwindem, typować props w TypeScript.
- Przy **design systemie**: tokeny z Figmy mapować do `tailwind.config` (kolory, spacing, typography).
- **Komponenty** = warstwa wizualna (React); **typy** = warstwa danych (TypeScript); **shadcn** to biblioteka komponentów, nie język.

---

*Ostatnia aktualizacja: 2026-02-28. Wzorzec dla bazy wiedzy agencji.*
