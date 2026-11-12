import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../state/DataContext.jsx';
import { ErrorState, LoadingState } from '../components/StatusViews.jsx';
import { useApp } from '../state/AppContext.jsx';
import { ease } from '../styles/motion.js';

const collator = new Intl.Collator('pl');
const ALPHABET = 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ'.split('');

export default function Dictionary() {
  const { openSign } = useApp();
  const { status, error, retry, signs, categoriesById } = useData();

  const groups = useMemo(() => {
    const map = new Map();
    [...signs]
      .sort((a, b) => collator.compare(a.name, b.name))
      .forEach((s) => {
        const letter = s.name[0].toLocaleUpperCase('pl');
        if (!map.has(letter)) map.set(letter, []);
        map.get(letter).push(s);
      });
    return map;
  }, [signs]);

  const jump = (e, letter) => {
    e.preventDefault();
    const target = document.getElementById(`litera-${letter}`);
    if (!target) return;
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    target.focus({ preventScroll: true });
  };

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">A–Ż</p>
        <h1 className="page-title">Słownik</h1>
        <p className="page-lead">
          {status === 'ready'
            ? `Wszystkie znaki (${signs.length}) w porządku alfabetycznym, z nazwą i opisem.`
            : 'Wszystkie znaki w porządku alfabetycznym, z nazwą i opisem.'}
        </p>
      </header>

      {status === 'loading' && <LoadingState variant="dictionary" label="Ładowanie słownika…" />}
      {status === 'error' && <ErrorState error={error} onRetry={retry} />}
      {status === 'ready' && (
        <>
          <nav className="az" aria-label="Skok do litery">
            <ul>
              {ALPHABET.map((l) =>
                groups.has(l) ? (
                  <li key={l}>
                    <a href={`#litera-${l}`} className="az__link" onClick={(e) => jump(e, l)}>{l}</a>
                  </li>
                ) : (
                  <li key={l}>
                    <span className="az__link az__link--empty" aria-hidden="true">{l}</span>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="dict">
            {[...groups.entries()].map(([letter, items]) => (
              <motion.section
                key={letter}
                className="dict__group"
                aria-labelledby={`litera-${letter}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 0.45, ease }}
              >
                <h2 id={`litera-${letter}`} className="dict__letter" tabIndex={-1}>{letter}</h2>
                <ul className="dict__list">
                  {items.map((s) => (
                    <li key={s.id}>
                      <button type="button" className="dict__row" onClick={() => openSign(s.id)} aria-haspopup="dialog">
                        <span className="dict__name">{s.name}</span>
                        <span className="dict__meaning">{s.description}</span>
                        <span className="dict__cat">{categoriesById[s.category]?.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
