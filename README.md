
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

## Uruchomienie
1. `npm install`
2. Skopiuj `.env.example` do `.env.local` (opcjonalnie).
3. Ustaw `OPENROUTER_API_KEY` w `.env.local` (OCR, plan, coverage, notatka).
4. Jeśli chcesz używać Whisper STT, ustaw `OPENAI_API_KEY`.
5. (Opcjonalnie) Dla dostawców zgodnych z API OpenAI (np. Atheneum) ustaw:
	- `OPENAI_BASE_URL` (adres API dostawcy),
	- `OPENAI_WHISPER_MODEL` (np. `whisper-1` lub model dostawcy),
	- `OPENAI_PROVIDER_NAME` (etykieta do logów i kosztów, np. `atheneum`).
6. Aby działało usuwanie konta, ustaw `SUPABASE_URL` oraz `SUPABASE_SERVICE_ROLE_KEY` po stronie serwera.
7. `npm run dev`

Adresy:
- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`
  