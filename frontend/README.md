# PJM — prototyp aplikacji do nauki Polskiego Języka Migowego

SPA w React + Vite. Estetyka „quiet luxury”: grafit / antracyt / złamana biel, jeden akcent (miedź), Inter Variable, animacje Framer Motion.

## Start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produkcja → dist/
```

## Backend (API)

Frontend pobiera dane z backendu Express (`../backend`). Najpierw uruchom:

```bash
docker compose up -d          # PostgreSQL
cd ../backend && npm run dev  # API na http://localhost:3001
```

Adres API: `.env` → `VITE_API_URL` (domyślnie `http://localhost:3001`, wzór w `.env.example`).

| Widok | Endpoint |
|---|---|
| Start, Kategoria, Słownik, modal znaku | `GET /api/categories` (raz przy starcie, trzymane w pamięci) |
| Alfabet | `GET /api/alphabet` |
| Wyszukiwarka (podpowiedzi + strona wyników) | `GET /api/signs/search?q=` (debounce 200 ms, anulowanie starych zapytań) |
| Odtwarzacz | `http://localhost:3001/videos/<video_url z bazy>` |

Stany: szkielety w kształcie treści podczas ładowania, panel „Brak połączenia” z przyciskiem
„Spróbuj ponownie” gdy backend nie odpowiada (timeout 8 s), komunikat w odtwarzaczu gdy pliku brak.

## Struktura

```
src/
  App.jsx                  routing widoków, przejścia stron, fokus po nawigacji
  state/AppContext.jsx     Context: hash-router, fraza wyszukiwania, aktywny znak (modal)
  api/client.js            fetch + timeout + mapowanie rekordów API (video_url → pełny URL)
  state/DataContext.jsx    dane z API: status loading/ready/error, retry()
  hooks/useSignSearch.js   wyszukiwanie serwerowe z debounce i AbortController
  components/StatusViews.jsx  szkielety ładowania + panel błędu
  components/
    Header.jsx             nawigacja z animowanym wskaźnikiem
    SearchBox.jsx          globalny combobox ARIA 1.2 z podpowiedziami
    SignModal.jsx          szczegóły znaku: focus trap, Esc, poprzedni/następny
    VideoPlayer.jsx        własny odtwarzacz: tempo 0.5×/0.75×/1×, pętla, pełny ekran
    SignGrid.jsx           siatka kart znaków
  pages/                   Home, Category, Dictionary (A–Ż), Alphabet, SearchResults
  styles/global.css        tokeny designu + cały system wizualny (mobile-first)
```

## Dostępność (WCAG 2.2 AA)

- **Kontrast**: tekst ≥ 4.6:1 (główny 15:1, akcent 6.7:1), wskaźnik fokusu miedziany 2 px, ≥ 3:1.
- **Klawiatura**: link „Przejdź do treści”, pełna obsługa Tab, Ctrl/⌘+K → wyszukiwarka, ↑/↓/Enter/Esc w podpowiedziach, Esc zamyka modal, fokus uwięziony w oknie i przywracany po zamknięciu.
- **Fokus nie jest zasłaniany** (2.4.11): `scroll-padding-top` = wysokość sticky nagłówka.
- **Cele dotykowe** (2.5.8): min. 44–48 px.
- **ARIA**: `role="search"`, combobox + listbox + `aria-activedescendant`, `role="status"` z liczbą wyników, `aria-current="page"`, `aria-modal`, `aria-pressed` w kontrolkach wideo, `aria-valuetext` na osi czasu.
- **Skróty odtwarzacza** (Spacja/K, ←/→, L) działają tylko z fokusem w odtwarzaczu (2.1.4).
- **Ruch**: `prefers-reduced-motion` wyłącza animacje i autostart wideo; `forced-colors` wspierane.
- Każda zmiana widoku ustawia `document.title` i przenosi fokus na `<main>`.

## Routing

Hash-router (`#/slownik`, `#/kategoria/rodzina`, `#/szukaj?q=kot`) — działa na każdym hostingu statycznym bez konfiguracji.
Otwarty znak trafia do URL (`?znak=mama`) → link można udostępnić, przycisk „Wstecz” zamyka okno.

## Do zrobienia przed publikacją

- Opisy znaków w bazie — **zweryfikować z lektorem PJM**.
- Audyt z czytnikiem ekranu (NVDA + Firefox, VoiceOver + Safari).
