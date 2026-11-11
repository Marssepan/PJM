import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const AppContext = createContext(null);

/** Hash routing: #/sciezka?param=wartosc — działa na każdym hostingu statycznym. */
function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(qs) };
}

function buildHash(path, params) {
  const qs = params && [...params].length ? `?${params.toString()}` : '';
  return `#${path}${qs}`;
}

export function AppProvider({ children }) {
  const [route, setRoute] = useState(parseHash);
  const [query, setQuery] = useState(() => parseHash().params.get('q') ?? '');
  const openedInApp = useRef(false);
  const returnFocusTo = useRef(null);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((path, params) => {
    window.location.hash = buildHash(path, params);
  }, []);

  const openSign = useCallback((id) => {
    returnFocusTo.current = document.activeElement;
    const { path, params } = parseHash();
    params.set('znak', id);
    openedInApp.current = true;
    window.location.hash = buildHash(path, params);
  }, []);

  const closeSign = useCallback(() => {
    if (openedInApp.current) {
      openedInApp.current = false;
      window.history.back();
    } else {
      const { path, params } = parseHash();
      params.delete('znak');
      window.history.replaceState(null, '', buildHash(path, params));
      setRoute(parseHash());
    }
    // Przywrócenie fokusu na element, który otworzył okno (WCAG 2.4.3).
    const el = returnFocusTo.current;
    requestAnimationFrame(() => el?.isConnected && el.focus());
  }, []);

  // Sam identyfikator — rekord znaku rozwiązuje App na podstawie danych z API (DataContext).
  const activeSignId = route.params.get('znak');

  const value = useMemo(
    () => ({ route, navigate, query, setQuery, activeSignId, openSign, closeSign }),
    [route, navigate, query, activeSignId, openSign, closeSign],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
