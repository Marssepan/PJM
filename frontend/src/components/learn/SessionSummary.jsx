import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IconArrow, IconRestart } from '../Icons.jsx';
import { ease } from '../../styles/motion.js';

/** Podsumowanie sesji fiszek / quizu. Fokus trafia na nagłówek, żeby czytnik od razu czytał wynik. */
export default function SessionSummary({ title, lead, stats, onRestart, restartLabel, altHref, altLabel, children }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, []);

  return (
    <motion.section
      className="summary"
      aria-labelledby="summary-title"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <p className="eyebrow">Podsumowanie</p>
      <h1 id="summary-title" ref={headingRef} tabIndex={-1} className="page-title">{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}

      <dl className="stats summary__stats">
        {stats.map((s) => (
          <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
        ))}
      </dl>

      {children}

      <div className="summary__actions">
        <button type="button" className="btn" onClick={onRestart}>
          <IconRestart aria-hidden="true" /> {restartLabel}
        </button>
        {altHref && (
          <a href={altHref} className="btn btn--ghost">
            {altLabel} <IconArrow aria-hidden="true" />
          </a>
        )}
        <a href="#/nauka" className="link-arrow">Wszystkie talie</a>
      </div>
    </motion.section>
  );
}
