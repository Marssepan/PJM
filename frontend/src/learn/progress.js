/**
 * Postęp nauki — system Leitnera (5 pudełek), zapisywany wyłącznie w localStorage.
 *
 *   pudełko 1 → nowe / nieznane     (pokazywane najczęściej)
 *   pudełko 5 → opanowane           (pokazywane najrzadziej)
 *
 * „Wiem”    → pudełko + 1
 * „Prawie”  → pudełko bez zmian
 * „Nie wiem”→ powrót do pudełka 1
 *
 * Klucz karty nie używa UUID z bazy (zmienia się przy każdym seedzie),
 * tylko slug (gdy jest) albo „kategoria:nazwa”.
 */

const STORAGE_KEY = 'pjm.progress.v1';
export const MAX_BOX = 5;
/** Od tego pudełka znak liczymy jako „opanowany”. */
export const MASTERED_BOX = 4;

export function itemKey(sign) {
  if (sign.slug) return sign.slug;
  if (sign.category === 'alfabet') return `alfabet:${sign.letter}`;
  return `${sign.category}:${sign.name}`;
}

export function readProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {}; // tryb prywatny, zablokowany storage, uszkodzony JSON
  }
}

export function writeProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* brak miejsca / zablokowany storage — postęp działa tylko w tej sesji */
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export const STORAGE_EVENT_KEY = STORAGE_KEY;

const empty = { box: 1, seen: 0, correct: 0, last: 0 };

export function entryOf(progress, key) {
  return progress[key] ?? empty;
}

/** @param {'again'|'hard'|'good'} result */
export function grade(progress, key, result) {
  const e = entryOf(progress, key);
  const box = result === 'good' ? Math.min(MAX_BOX, e.box + 1) : result === 'again' ? 1 : e.box;
  return {
    ...progress,
    [key]: {
      box,
      seen: e.seen + 1,
      correct: e.correct + (result === 'good' ? 1 : 0),
      last: Date.now(),
    },
  };
}

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Wybór kart do sesji: najpierw niskie pudełka, a w ramach pudełka te najdawniej widziane.
 * Losowy „szum” miesza karty o tym samym priorytecie, wynik jest tasowany.
 */
export function pickSession(items, progress, size = 10) {
  const ranked = items
    .map((sign) => {
      const e = entryOf(progress, itemKey(sign));
      return { sign, score: e.box * 1e13 + e.last + Math.random() };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, size)
    .map((r) => r.sign);
  return shuffle(ranked);
}

export function deckStats(items, progress) {
  let mastered = 0;
  let seen = 0;
  for (const sign of items) {
    const e = progress[itemKey(sign)];
    if (!e) continue;
    seen += 1;
    if (e.box >= MASTERED_BOX) mastered += 1;
  }
  return { total: items.length, seen, mastered };
}
