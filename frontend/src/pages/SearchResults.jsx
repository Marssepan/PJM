import { useEffect } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { useData } from '../state/DataContext.jsx';
import useSignSearch from '../hooks/useSignSearch.js';
import SignGrid from '../components/SignGrid.jsx';
import { ErrorState, LoadingState } from '../components/StatusViews.jsx';
import { plural } from '../components/SearchBox.jsx';

export default function SearchResults() {
  const { query, setQuery, route } = useApp();
  const { categories } = useData();
  const urlQuery = route.params.get('q') ?? '';

  // Wejście z linku / historii: URL jest źródłem prawdy dla frazy.
  useEffect(() => {
    if (urlQuery && urlQuery !== query) setQuery(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const search = useSignSearch(query);
  const { results } = search;
  const q = query.trim();
  // Pierwsze zapytanie (brak poprzednich wyników) → szkielet; kolejne → wyniki zostają, lekko przygaszone.
  const firstLoad = search.status === 'loading' && search.for === '';

  let lead = 'Wpisz frazę w polu wyszukiwania u góry strony.';
  if (q && search.status === 'ready') lead = `${results.length} ${plural(results.length)}`;
  if (q && search.status === 'loading') lead = 'Szukam…';

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Wyszukiwanie</p>
        <h1 className="page-title">{q ? <>„{q}”</> : 'Szukaj znaku'}</h1>
        <p className="page-lead" aria-live="polite">{search.status === 'error' ? '' : lead}</p>
      </header>

      {firstLoad && <LoadingState variant="signs" label="Wyszukiwanie…" count={4} />}

      {search.status === 'error' && (
        <ErrorState error={search.error} title="Wyszukiwanie jest chwilowo niedostępne" onRetry={search.retry} />
      )}

      {results.length > 0 && search.status !== 'error' && (
        <div className={`results${search.status === 'loading' ? ' is-stale' : ''}`} aria-busy={search.status === 'loading'}>
          <SignGrid key={search.for} signs={results} showCategory label="Wyniki wyszukiwania" />
        </div>
      )}

      {q && search.status === 'ready' && results.length === 0 && (
        <div className="empty">
          <p>Nie znaleziono znaku. Sprawdź pisownię lub przeglądaj kategorie:</p>
          <ul className="chips__inline">
            {categories.map((c) => (
              <li key={c.id}><a className="chip" href={`#/kategoria/${c.id}`}>{c.name}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
