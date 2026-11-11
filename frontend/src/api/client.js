/**
 * Klient REST API backendu PJM (Express + Prisma).
 * Adres bazowy: VITE_API_URL w pliku .env (domyślnie http://localhost:3001).
 *
 * API zwraca surowe rekordy bazy (snake_case: video_url, category_id).
 * Mappery poniżej zamieniają je na jeden kształt używany w całym UI:
 *   Sign     { id, name, description, category (slug), video, videoFile }
 *   Category { id (slug), dbId, name }
 *   Letter   { id, letter, name, description, dynamic (← requiresMovement), category: 'alfabet', video, videoFile }
 */

export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

/** Nagrania: lokalnie z backendu, na GitHub Pages z samego Pages (VITE_VIDEO_URL). */
export const VIDEO_BASE = (import.meta.env.VITE_VIDEO_URL || `${API_BASE}/videos`).replace(/\/+$/, '');

/** Domyślny timeout. Pierwsze ładowanie dostaje dłuższy — darmowy serwer budzi się do ~1 min. */
const REQUEST_TIMEOUT_MS = 8000;
export const COLD_START_TIMEOUT_MS = 90000;

export class ApiError extends Error {
  /** @param {'network'|'timeout'|'http'|'parse'} kind */
  constructor(kind, message, status) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** Pełny URL nagrania: <VIDEO_BASE>/<plik z bazy>. */
export function videoUrl(fileName) {
  if (!fileName) return null;
  if (/^https?:\/\//i.test(fileName)) return fileName; // gdyby baza kiedyś trzymała pełny URL
  const clean = String(fileName).replace(/^\/+/, '').replace(/^videos\//, '');
  return `${VIDEO_BASE}/${clean.split('/').map(encodeURIComponent).join('/')}`;
}

/** fetch + timeout + przerwanie (AbortSignal z komponentu) + czytelne błędy. */
async function getJson(path, { signal, timeout = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'TimeoutError')), timeout);
  const onAbort = () => controller.abort(signal.reason);
  signal?.addEventListener('abort', onAbort);

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    if (signal?.aborted) throw err; // anulowane przez komponent — nie jest błędem UI
    if (controller.signal.reason?.name === 'TimeoutError') {
      throw new ApiError('timeout', 'Serwer nie odpowiada.');
    }
    throw new ApiError('network', 'Brak połączenia z serwerem.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  if (!res.ok) {
    let message = `Błąd serwera (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch { /* treść nie-JSON */ }
    throw new ApiError('http', message, res.status);
  }

  try {
    return await res.json();
  } catch {
    throw new ApiError('parse', 'Nieprawidłowa odpowiedź serwera.');
  }
}

// ---------------------------------------------------------------------------
// Mappery
// ---------------------------------------------------------------------------
const pick = (row, ...keys) => keys.map((k) => row?.[k]).find((v) => v !== undefined && v !== null);


export function toCategory(row) {
  return {
    id: String(pick(row, 'slug') ?? row.id),
    dbId: row.id,
    name: row.name,
    description: pick(row, 'description') ?? '',
  };
}

/** @param {Map<any,string>} categorySlugByDbId */
export function toSign(row, categorySlugByDbId) {
  const file = pick(row, 'video_url', 'videoUrl');
  const catDbId = pick(row, 'category_id', 'categoryId') ?? row.category?.id;
  return {
    id: String(row.id),
    name: row.name,
    description: row.description ?? '',
    category: row.category?.slug ?? categorySlugByDbId.get(catDbId) ?? '',
    videoFile: file ?? null,
    video: videoUrl(file),
  };
}

export function toLetter(row) {
  const letter = String(row.letter).toLocaleUpperCase('pl');
  // Z bazy: Alphabet.requiresMovement (Prisma zwraca camelCase; snake_case na wszelki wypadek).
  const dynamic = Boolean(pick(row, 'requiresMovement', 'requires_movement'));
  const file = pick(row, 'video_url', 'videoUrl');
  return {
    id: `litera-${row.id}`,
    letter,
    name: `Litera ${letter}`,
    dynamic,
    description: dynamic
      ? `Znak litery ${letter} w alfabecie palcowym PJM. Znak dynamiczny — zwróć uwagę na ruch dłoni.`
      : `Znak litery ${letter} w alfabecie palcowym PJM. Układ statyczny — skup się na kształcie dłoni.`,
    category: 'alfabet',
    videoFile: file ?? null,
    video: videoUrl(file),
  };
}

// ---------------------------------------------------------------------------
// Endpointy
// ---------------------------------------------------------------------------
export const api = {
  /** GET /api/categories — kategorie z zagnieżdżonymi znakami. */
  categories: (opts) => getJson('/api/categories', opts),
  /** GET /api/alphabet — alfabet (posortowany na serwerze). */
  alphabet: (opts) => getJson('/api/alphabet', opts),
  /** GET /api/signs/search?q= */
  searchSigns: (q, opts) => getJson(`/api/signs/search?q=${encodeURIComponent(q)}`, opts),
};
