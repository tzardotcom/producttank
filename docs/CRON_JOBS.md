# Zadania cykliczne (reminder, follow-up)

Aplikacja udostępnia endpointy wywoływane przez crona, które wysyłają maile:
- **Reminder** – dzień przed eventem (przypomnienie)
- **Follow-up** – dzień po zakończeniu eventu (link do ankiety feedback)

## Zmienna środowiskowa

W Vercel / `.env.local` ustaw:

```
CRON_SECRET=dowolny-tajny-ciag
```

Wywołania muszą przekazać nagłówek: `Authorization: Bearer <CRON_SECRET>`.

W **produkcji** (Vercel / `NODE_ENV=production`) `CRON_SECRET` jest **wymagane** – brak ustawienia zwraca 500, brak poprawnego nagłówka 401. Lokalnie bez `CRON_SECRET` endpointy przyjmują wywołania bez autoryzacji (do testów).

## Endpointy

| Zadanie   | URL | Opis |
|-----------|-----|------|
| Reminder  | `GET /api/jobs/send-reminders` | Wysyła maile przypomnienia do zapisanych na eventy zaczynające się **jutro**. |
| Follow-up | `GET /api/jobs/send-feedback-followup` | Wysyła maile z linkiem do ankiety do uczestników eventów, które **zakończyły się wczoraj**. |

## Vercel Cron

W `vercel.json` dodaj:

```json
{
  "crons": [
    {
      "path": "/api/jobs/send-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/jobs/send-feedback-followup",
      "schedule": "0 10 * * *"
    }
  ]
}
```

- `0 9 * * *` – codziennie o 9:00 UTC (reminder)
- `0 10 * * *` – codziennie o 10:00 UTC (follow-up)

W Vercel ustaw zmienną `CRON_SECRET` w **Environment Variables** (Production). Vercel przy wywołaniu crona automatycznie dodaje nagłówek `Authorization: Bearer <CRON_SECRET>` – endpointy go weryfikują.

Harmonogram w `vercel.json`: reminder 9:00 UTC, follow-up 10:00 UTC (codziennie).

## Supabase

Zamiast Vercel Cron możesz użyć Supabase Edge Function wywoływanej przez pg_cron (np. codziennie o określonej godzinie), która wewnętrznie wywołuje te URL-e z `CRON_SECRET`.
