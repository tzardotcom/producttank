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

Jeśli `CRON_SECRET` nie jest ustawione, endpointy przyjmują wywołania bez autoryzacji (tylko do testów lokalnych).

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

W Vercel ustaw zmienną `CRON_SECRET` w Environment Variables. Vercel Cron przy wywołaniu nie dodaje automatycznie nagłówka `Authorization` – musisz ustawić **Cron Secret** w ustawieniach projektu (Settings → Crons) lub użyć innej metody (np. serverless function wywołująca endpoint z nagłówkiem).

Alternatywa: użyj zewnętrznego crona (np. cron-job.org, GitHub Actions) z GET + nagłówkiem `Authorization: Bearer <CRON_SECRET>`.

## Supabase

Zamiast Vercel Cron możesz użyć Supabase Edge Function wywoływanej przez pg_cron (np. codziennie o określonej godzinie), która wewnętrznie wywołuje te URL-e z `CRON_SECRET`.
