import { motion } from 'framer-motion';
import { useApp } from '../state/AppContext.jsx';
import { useData } from '../state/DataContext.jsx';
import { ErrorState, LoadingState } from '../components/StatusViews.jsx';
import { ease } from '../styles/motion.js';

const list = { hidden: {}, show: { transition: { staggerChildren: 0.02 } } };
const item = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } } };

export default function Alphabet() {
  const { openSign } = useApp();
  const { status, error, retry, alphabet } = useData();

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Daktylografia</p>
        <h1 className="page-title">Alfabet PJM</h1>
        <p className="page-lead">
          Alfabet palcowy służy do literowania imion, nazw własnych i słów bez osobnego znaku.
          Litery oznaczone kropką wymagają ruchu dłoni.
        </p>
      </header>

      {status === 'loading' && <LoadingState variant="alphabet" label="Ładowanie alfabetu…" />}
      {status === 'error' && <ErrorState error={error} onRetry={retry} />}
      {status === 'ready' && (
        <>
          {/* Kolejność z API (/api/alphabet sortuje po polsku). */}
          <motion.ul className="alpha-grid" aria-label="Litery alfabetu palcowego" variants={list} initial="hidden" animate="show">
            {alphabet.map((l) => (
              <motion.li key={l.id} variants={item}>
                <button
                  type="button"
                  className="alpha-tile"
                  onClick={() => openSign(l.id)}
                  aria-haspopup="dialog"
                  aria-label={`${l.name}${l.dynamic ? ', znak z ruchem' : ''}`}
                >
                  <span className="alpha-tile__letter" aria-hidden="true">{l.letter}</span>
                  {l.dynamic && <span className="alpha-tile__dot" aria-hidden="true" />}
                </button>
              </motion.li>
            ))}
          </motion.ul>

          <p className="legend">
            <span className="alpha-tile__dot alpha-tile__dot--inline" aria-hidden="true" /> Znak dynamiczny (z ruchem)
          </p>
        </>
      )}
    </div>
  );
}
