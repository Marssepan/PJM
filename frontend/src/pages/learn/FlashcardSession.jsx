import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../../state/DataContext.jsx';
import useProgress from '../../learn/useProgress.js';
import { grade, itemKey, pickSession } from '../../learn/progress.js';
import { findDeck } from '../../learn/decks.js';
import SessionHeader from '../../components/learn/SessionHeader.jsx';
import Flashcard from '../../components/learn/Flashcard.jsx';
import SessionSummary from '../../components/learn/SessionSummary.jsx';
import { ErrorState, LoadingState } from '../../components/StatusViews.jsx';
import NotFound from '../NotFound.jsx';
import { ease } from '../../styles/motion.js';

const SESSION_SIZE = 10;

const GRADES = [
  { id: 'again', label: 'Nie wiem', hint: 'wróci jeszcze w tej sesji' },
  { id: 'hard', label: 'Prawie', hint: 'bez zmiany pudełka' },
  { id: 'good', label: 'Wiem', hint: 'rzadziej w kolejnych sesjach' },
];

function Session({ deck }) {
  const { progress, update } = useProgress();
  const [queue, setQueue] = useState(() => pickSession(deck.items, progress, SESSION_SIZE));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState('sign-to-word');
  const [results, setResults] = useState({ again: 0, hard: 0, good: 0 });
  const requeued = useRef(new Set());
  const flipRef = useRef(null);

  const done = index >= queue.length;
  const sign = queue[index];

  // Nowa karta → fokus na przycisk „Odwróć” (klawiatura nie ląduje na <body>).
  useEffect(() => {
    if (!done) flipRef.current?.focus({ preventScroll: true });
  }, [index, done]);

  const onGrade = (result) => {
    const key = itemKey(sign);
    update((p) => grade(p, key, result));
    setResults((r) => ({ ...r, [result]: r[result] + 1 }));
    // „Nie wiem” → karta wraca na koniec tej sesji (jeden raz).
    if (result === 'again' && !requeued.current.has(key)) {
      requeued.current.add(key);
      setQueue((q) => [...q, sign]);
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    requeued.current = new Set();
    setQueue(pickSession(deck.items, progress, SESSION_SIZE));
    setIndex(0);
    setFlipped(false);
    setResults({ again: 0, hard: 0, good: 0 });
  };

  if (done) {
    return (
      <SessionSummary
        title="Sesja zakończona"
        lead={`Przejrzane fiszki: ${results.again + results.hard + results.good}.`}
        stats={[
          { label: 'Wiem', value: results.good },
          { label: 'Prawie', value: results.hard },
          { label: 'Nie wiem', value: results.again },
        ]}
        onRestart={restart}
        restartLabel="Nowa sesja"
        altHref={`#/nauka/quiz/${deck.id}`}
        altLabel="Sprawdź się w quizie"
      />
    );
  }

  return (
    <>
      <SessionHeader mode="Fiszki" title={deck.title} current={index} total={queue.length}>
        <div className="segmented" role="group" aria-label="Kierunek fiszek">
          {[
            ['sign-to-word', 'Znak → słowo'],
            ['word-to-sign', 'Słowo → znak'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="segmented__btn"
              aria-pressed={direction === id}
              onClick={() => {
                setDirection(id);
                setFlipped(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </SessionHeader>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${index}-${direction}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease }}
        >
          <Flashcard sign={sign} flipped={flipped} direction={direction} />
        </motion.div>
      </AnimatePresence>

      <div className="flash-actions">
        {!flipped ? (
          <button ref={flipRef} type="button" className="btn btn--wide" onClick={() => setFlipped(true)}>
            Odwróć kartę
          </button>
        ) : (
          <div className="grade" role="group" aria-label="Jak Ci poszło?">
            {GRADES.map((g) => (
              <button key={g.id} type="button" className={`grade__btn grade__btn--${g.id}`} onClick={() => onGrade(g.id)}>
                <span className="grade__label">{g.label}</span>
                <span className="grade__hint">{g.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function FlashcardSession({ deckId }) {
  const data = useData();

  if (data.status === 'loading') {
    return <div className="container"><LoadingState variant="signs" count={2} label="Ładowanie fiszek…" /></div>;
  }
  if (data.status === 'error') {
    return <div className="container session"><ErrorState error={data.error} onRetry={data.retry} /></div>;
  }

  const deck = findDeck(data, deckId);
  if (!deck) return <NotFound />;

  return (
    <div className="container session">
      <Session key={deck.id} deck={deck} />
    </div>
  );
}
