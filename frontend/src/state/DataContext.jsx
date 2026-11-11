import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, COLD_START_TIMEOUT_MS, toCategory, toLetter, toSign } from '../api/client.js';

/** Po tylu ms ładowania pokazujemy komunikat „serwer się uruchamia”. */
const SLOW_AFTER_MS = 4000;

/**
 * Dane słownika pobierane raz przy starcie (kategorie + znaki + alfabet).
 * Zbiór jest mały (dziesiątki rekordów), więc trzymamy go w pamięci —
 * nawigacja między widokami jest natychmiastowa, a modal działa z linku.
 * Wyszukiwanie idzie osobno do /api/signs/search (useSignSearch).
 *
 * status: 'loading' | 'ready' | 'error'
 */
const DataContext = createContext(null);

const EMPTY = { categories: [], signs: [], alphabet: [] };

export function DataProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError(null);
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    const opts = { signal: controller.signal, timeout: COLD_START_TIMEOUT_MS };

    Promise.all([api.categories(opts), api.alphabet(opts)])
      .then(([catRows, letterRows]) => {
        const categories = catRows.map(toCategory);
        const slugByDbId = new Map(categories.map((c) => [c.dbId, c.id]));
        const signs = catRows.flatMap((row) =>
          (row.signs ?? []).map((s) => toSign({ ...s, category_id: s.category_id ?? s.categoryId ?? row.id }, slugByDbId)),
        );
        setData({ categories, signs, alphabet: letterRows.map(toLetter) });
        setStatus('ready');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('[DataProvider]', err);
        setError(err);
        setStatus('error');
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const value = useMemo(() => {
    const categoriesById = Object.fromEntries(data.categories.map((c) => [c.id, c]));
    const signsById = Object.fromEntries(data.signs.map((s) => [s.id, s]));
    const lettersById = Object.fromEntries(data.alphabet.map((l) => [l.id, l]));
    const countByCategory = data.signs.reduce((acc, s) => ({ ...acc, [s.category]: (acc[s.category] ?? 0) + 1 }), {});
    return {
      status,
      /** true → ładowanie trwa długo (darmowy serwer wybudza się po uśpieniu). */
      slow: status === 'loading' && slow,
      error,
      retry,
      ...data,
      categoriesById,
      signsById,
      countByCategory,
      /** Znak lub litera po id (modal). */
      findById: (id) => signsById[id] ?? lettersById[id] ?? null,
    };
  }, [status, slow, error, retry, data]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
