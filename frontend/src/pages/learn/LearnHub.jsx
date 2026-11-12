import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../state/DataContext.jsx';
import useProgress from '../../learn/useProgress.js';
import { deckStats, MASTERED_BOX } from '../../learn/progress.js';
import { getDecks } from '../../learn/decks.js';
import { ErrorState, LoadingState } from '../../components/StatusViews.jsx';
import { IconArrow } from '../../components/Icons.jsx';
import { ease } from '../../styles/motion.js';

const list = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } };

function ProgressBar({ value, max, label }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="pbar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value} z ${max} opanowanych`}>
      <motion.span className="pbar__fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease }} />
    </div>
  );
}

export default function LearnHub() {
  const data = useData();
  const { progress, reset } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const onReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      resetTimer.current = setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    clearTimeout(resetTimer.current);
    setConfirmReset(false);
    reset();
  };

  const decks = data.status === 'ready' ? getDecks(data) : [];
  const allItems = [...data.signs, ...data.alphabet];
  const total = deckStats(allItems, progress);

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Strefa nauki</p>
        <h1 className="page-title">Nauka</h1>
        <p className="page-lead">
          Fiszki pokazują częściej znaki, które sprawiają Ci trudność. Quiz sprawdza, czy rozpoznajesz znak z nagrania.
          Postęp zapisuje się tylko w tej przeglądarce.
        </p>
      </header>

      {data.status === 'loading' && <LoadingState variant="dictionary" label="Ładowanie talii…" />}
      {data.status === 'error' && <ErrorState error={data.error} onRetry={data.retry} />}

      {data.status === 'ready' && (
        <>
          <section className="learn-summary" aria-labelledby="learn-summary-title">
            <h2 id="learn-summary-title" className="visually-hidden">Twój postęp</h2>
            <dl className="stats">
              <div><dt>Opanowane</dt><dd>{total.mastered}</dd></div>
              <div><dt>Ćwiczone</dt><dd>{total.seen}</dd></div>
              <div><dt>Wszystkie</dt><dd>{total.total}</dd></div>
            </dl>
            <p className="learn-summary__note">
              Znak jest „opanowany”, gdy trafi do pudełka {MASTERED_BOX} z 5 — po kilku poprawnych odpowiedziach z rzędu.
            </p>
          </section>

          <section className="section" aria-labelledby="decks-title">
            <div className="section__head">
              <h2 id="decks-title" className="section__title">Wybierz talię</h2>
              {total.seen > 0 && (
                <button type="button" className={`text-btn${confirmReset ? ' text-btn--danger' : ''}`} onClick={onReset}>
                  {confirmReset ? 'Na pewno? Kliknij ponownie' : 'Wyczyść postęp'}
                </button>
              )}
            </div>
            <p className="visually-hidden" role="status">{confirmReset ? 'Kliknij ponownie, aby usunąć cały postęp nauki.' : ''}</p>

            <motion.ul className="deck-list" variants={list} initial="hidden" animate="show">
              {decks.map((d) => {
                const s = deckStats(d.items, progress);
                return (
                  <motion.li key={d.id} variants={item} className="deck">
                    <div className="deck__info">
                      <h3 className="deck__title">{d.title}</h3>
                      <p className="deck__meta">
                        {s.mastered} / {s.total} opanowanych
                        {d.description ? <span className="deck__desc"> · {d.description}</span> : null}
                      </p>
                      <ProgressBar value={s.mastered} max={s.total} label={`Postęp: ${d.title}`} />
                    </div>
                    <div className="deck__actions">
                      <a href={`#/nauka/fiszki/${d.id}`} className="btn btn--ghost" aria-label={`Fiszki: ${d.title}`}>
                        Fiszki
                      </a>
                      <a href={`#/nauka/quiz/${d.id}`} className="btn" aria-label={`Quiz: ${d.title}`}>
                        Quiz <IconArrow aria-hidden="true" />
                      </a>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          </section>
        </>
      )}
    </div>
  );
}
