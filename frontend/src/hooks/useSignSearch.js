import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, toSign } from '../api/client.js';
import { useData } from '../state/DataContext.jsx';

const DEBOUNCE_MS = 200;

/**
 * Wyszukiwanie po stronie serwera: GET /api/signs/search?q=
 * – debounce 200 ms (bez zapytania na każdy znak klawiatury),
 * – AbortController anuluje nieaktualne zapytania (brak „wyścigu” wyników),
 * – status: 'idle' | 'loading' | 'ready' | 'error'; retry() ponawia ostatnie zapytanie.
 */
export default function useSignSearch(query) {
  const { categories } = useData();
  const q = query.trim();
  const [state, setState] = useState({ status: 'idle', results: [], error: null, for: '' });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const slugByDbId = useMemo(() => new Map(categories.map((c) => [c.dbId, c.id])), [categories]);

  useEffect(() => {
    if (!q) {
      setState({ status: 'idle', results: [], error: null, for: '' });
      return undefined;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading' }));

    const timer = setTimeout(() => {
      api
        .searchSigns(q, { signal: controller.signal })
        .then((rows) => setState({ status: 'ready', results: rows.map((r) => toSign(r, slugByDbId)), error: null, for: q }))
        .catch((err) => {
          if (controller.signal.aborted) return;
          setState({ status: 'error', results: [], error: err, for: q });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, slugByDbId, attempt]);

  return { ...state, retry };
}
