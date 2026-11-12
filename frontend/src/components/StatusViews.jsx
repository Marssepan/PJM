import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../state/DataContext.jsx';
import { API_BASE } from '../api/client.js';
import { IconRestart } from './Icons.jsx';
import { ease } from '../styles/motion.js';


/**
 * Szkielety ładowania w kształcie docelowej treści — brak „skoku” układu.
 * Czytnik ekranu słyszy jeden komunikat (role=status), szkielet jest aria-hidden.
 */
export function LoadingState({ variant = 'signs', label = 'Ładowanie danych…', count }) {
  const n = count ?? { categories: 6, signs: 8, alphabet: 18, dictionary: 6, list: 4 }[variant] ?? 6;
  const { slow } = useData();
  return (
    <div className="loading" aria-busy="true">
      <p role="status" className="visually-hidden">{label}</p>
      {/* Darmowy hosting usypia serwer — uprzedzamy, zamiast zostawić użytkownika z szkieletem na minutę. */}
      <AnimatePresence>
        {slow && (
          <motion.p
            className="wake-note"
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <span className="wake-note__pulse" aria-hidden="true" />
            Serwer się uruchamia — po dłuższej przerwie może to potrwać do minuty.
          </motion.p>
        )}
      </AnimatePresence>
      <motion.ul
        className={`skeleton-grid skeleton-grid--${variant}`}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15, ease }} // krótkie odpowiedzi nie migają szkieletem
      >
        {Array.from({ length: n }, (_, i) => (
          <li key={i} className={`skeleton skeleton--${variant}`} style={{ '--i': i }}>
            <span className="skeleton__line skeleton__line--title" />
            <span className="skeleton__line" />
            {variant === 'categories' && <span className="skeleton__line skeleton__line--short" />}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

/** Nagłówek strony w trakcie ładowania (gdy tytuł zależy od danych). */
export function LoadingHead() {
  return (
    <header className="page-head" aria-hidden="true">
      <span className="skeleton__line skeleton__line--eyebrow" />
      <span className="skeleton__line skeleton__line--heading" />
      <span className="skeleton__line skeleton__line--lead" />
    </header>
  );
}

/**
 * Błąd połączenia z backendem. role="alert" ogłasza problem,
 * przycisk „Spróbuj ponownie” dostaje fokus tylko gdy błąd zastąpił treść, na której był fokus.
 */
export function ErrorState({ error, onRetry, title, compact = false }) {
  const retryRef = useRef(null);
  const offline = !error || error.kind === 'network' || error.kind === 'timeout';

  useEffect(() => {
    if (document.activeElement === document.body) retryRef.current?.focus();
  }, []);

  return (
    <motion.div
      className={`state-panel${compact ? ' state-panel--compact' : ''}`}
      role="alert"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      <span className="state-panel__mark" aria-hidden="true" />
      <div className="state-panel__body">
        <p className="eyebrow">{offline ? 'Brak połączenia' : 'Błąd serwera'}</p>
        <h2 className="state-panel__title">
          {title ?? (offline ? 'Nie udało się połączyć z serwerem' : 'Nie udało się pobrać danych')}
        </h2>
        <p className="state-panel__text">
          {offline ? (
            <>
              Sprawdź, czy backend działa pod adresem <code>{API_BASE}</code>, a kontener PostgreSQL jest uruchomiony.
            </>
          ) : (
            error?.message
          )}
        </p>
        {onRetry && (
          <button ref={retryRef} type="button" className="btn" onClick={onRetry}>
            <IconRestart aria-hidden="true" />
            Spróbuj ponownie
          </button>
        )}
      </div>
    </motion.div>
  );
}
