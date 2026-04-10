
# Lesson Planning and Management (Vue)

Projekt został przeniesiony z React do Vue z zachowaniem designu i podłączeniem funkcjonalności:
- przygotowanie materiałów (TXT/PDF/JPG/PNG + OCR),
- generowanie i edycja planu,
- lekcja live z mikrofonem i semantycznym pokryciem punktów,
- prezentacja nieomówionych punktów,
- archiwum, notatka końcowa, QR,
- panel admina i licencje.

## Stack
- Frontend: Vue 3 + Vite + Vue Router
- Backend: Express API
- Baza danych: Supabase (PostgreSQL)

## Uruchomienie
1. `npm install`
2. W Supabase SQL Editor uruchom skrypt z `supabase/schema.sql`.
3. Utwórz plik `.env.local` w katalogu głównym projektu.
4. Dodaj wymagane zmienne:

```env
OPENROUTER_API_KEY=...
OPENAI_API_KEY=...
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
PUBLIC_APP_URL=https://YOUR_PUBLIC_FRONTEND_DOMAIN
VITE_API_BASE_URL=https://YOUR_PUBLIC_API_DOMAIN
VITE_PUBLIC_APP_URL=https://YOUR_PUBLIC_FRONTEND_DOMAIN
```

5. `npm run dev`

Adresy:
- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

## Automatyczny zapis notatek i podsumowań
- `POST /api/lessons/:lessonId/transcript` automatycznie dopisuje transkrypcję do lekcji i zapisuje ją w bazie.
- `POST /api/lessons/:lessonId/finalize` zapisuje finalną notatkę HTML oraz krótkie podsumowanie lekcji (`finalNote.summary`) w bazie.
- Jeśli `SUPABASE_URL` lub `SUPABASE_SERVICE_ROLE_KEY` nie są ustawione, aplikacja działa w trybie pamięci RAM (bez trwałego zapisu).

## QR i dostęp globalny (telefon)
- QR działa globalnie tylko wtedy, gdy `shareUrl` wskazuje publiczny adres (nie `localhost`).
- Ustaw `PUBLIC_APP_URL` i `VITE_PUBLIC_APP_URL` na publiczny adres frontendu.
- Ustaw `VITE_API_BASE_URL` na publiczny adres API.
- Lokalnie możesz użyć tunelu (np. Cloudflare Tunnel lub ngrok) i te publiczne URL-e wpisać do `.env.local`.
  