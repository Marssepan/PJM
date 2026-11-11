import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../state/AppContext.jsx';
import { useData } from '../state/DataContext.jsx';
import useSignSearch from '../hooks/useSignSearch.js';
import { IconSearch, IconClose } from './Icons.jsx';

const MAX_SUGGESTIONS = 6;
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * Globalna wyszukiwarka — wzorzec ARIA 1.2 „combobox z listą”.
 * ↑/↓ — wybór podpowiedzi, Enter — otwarcie znaku lub pełnych wyników,
 * Esc — zamknięcie listy / wyczyszczenie, Ctrl/⌘ + K — fokus z dowolnego miejsca.
 */
export default function SearchBox() {
  const { query, setQuery, navigate, openSign, route } = useApp();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const uid = useId();
  const listId = `${uid}-lista`;
  const statusId = `${uid}-status`;

  const { categoriesById } = useData();
  const search = useSignSearch(query);
  const results = search.results;
  const suggestions = results.slice(0, MAX_SUGGESTIONS);
  const searching = search.status === 'loading';
  const expanded = open && query.trim().length > 0;
  const onSearchPage = route.path === '/szukaj';

  useEffect(() => setActive(-1), [query, results]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, []);

  const showAll = () => {
    setOpen(false);
    navigate('/szukaj', new URLSearchParams({ q: query.trim() }));
  };

  const choose = (sign) => {
    setOpen(false);
    openSign(sign.id);
  };

  const onKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        setActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setOpen(true);
        setActive((i) => (suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1));
        break;
      case 'Enter':
        if (!query.trim()) return;
        e.preventDefault();
        if (expanded && active >= 0 && suggestions[active]) choose(suggestions[active]);
        else showAll();
        break;
      case 'Escape':
        if (expanded) setOpen(false);
        else setQuery('');
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
    }
  };

  // Komunikat dla czytników ekranu — tylko stany końcowe (bez „Szukam…” przy każdym znaku).
  const status = !query.trim() || searching
    ? ''
    : search.status === 'error'
      ? 'Wyszukiwanie niedostępne — brak połączenia z serwerem.'
      : results.length === 0
        ? 'Brak wyników.'
        : `${results.length} ${plural(results.length)}. Użyj strzałek, aby wybrać.`;

  return (
    <div className="search" ref={wrapRef}>
      <form
        role="search"
        aria-label="Wyszukiwarka znaków"
        className="search__form"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) showAll();
        }}
      >
        <label htmlFor={`${uid}-input`} className="visually-hidden">
          Szukaj znaku
        </label>
        <IconSearch className="search__icon" aria-hidden="true" />
        <input
          id={`${uid}-input`}
          ref={inputRef}
          className="search__input"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded && !onSearchPage}
          aria-controls={listId}
          aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
          aria-describedby={statusId}
          autoComplete="off"
          spellCheck="false"
          enterKeyHint="search"
          placeholder="Szukaj znaku…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {!query && <kbd className="search__kbd" aria-hidden="true">{isMac ? '⌘ K' : 'Ctrl K'}</kbd>}
        {query && (
          <button
            type="button"
            className="search__clear"
            aria-label="Wyczyść wyszukiwanie"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <IconClose aria-hidden="true" />
          </button>
        )}
      </form>

      <p id={statusId} className="visually-hidden" role="status" aria-live="polite">
        {status}
      </p>

      <AnimatePresence>
        {expanded && !onSearchPage && (
          <motion.div
            className="search__panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul id={listId} role="listbox" aria-label="Podpowiedzi" aria-busy={searching} className="search__list">
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className="search__option"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(s)}
                  onPointerMove={() => setActive(i)}
                >
                  <span className="search__option-name">{s.name}</span>
                  <span className="search__option-meta">{categoriesById[s.category]?.name}</span>
                </li>
              ))}
            </ul>
            {searching && <span className="search__progress" aria-hidden="true" />}
            {search.status === 'error' ? (
              <p className="search__empty search__empty--error">Wyszukiwanie niedostępne — brak połączenia z serwerem.</p>
            ) : suggestions.length === 0 ? (
              <p className="search__empty">{searching ? 'Szukam…' : <>Brak znaków dla „{query.trim()}”.</>}</p>
            ) : (
              <button type="button" className="search__all" onPointerDown={(e) => e.preventDefault()} onClick={showAll}>
                Wszystkie wyniki ({results.length})
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function plural(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (n === 1) return 'wynik';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'wyniki';
  return 'wyników';
}
