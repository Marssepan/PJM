import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../state/AppContext.jsx';
import { useData } from '../../state/DataContext.jsx';
import useProgress from '../../learn/useProgress.js';
import { grade, itemKey, pickSession, shuffle } from '../../learn/progress.js';
import { answerOf, findDeck } from '../../learn/decks.js';
import SessionHeader from '../../components/learn/SessionHeader.jsx';
import SessionSummary from '../../components/learn/SessionSummary.jsx';
import VideoPlayer from '../../components/VideoPlayer.jsx';
import { ErrorState, LoadingState } from '../../components/StatusViews.jsx';
import { IconArrow, IconClose } from '../../components/Icons.jsx';
import NotFound from '../NotFound.jsx';
import { ease } from '../../styles/motion.js';

const QUIZ_SIZE = 10;
const OPTIONS = 4;

const IconCheck = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false" {...p}>
    <path d="M5 12.5 10 17 19 7" />
  </svg>
);

/**
 * Pytania: nagranie + 4 odpowiedzi. Błędne odpowiedzi losowane z tej samej talii,
 * a gdy jest za mała — z całego słownika (litery tylko z alfabetu).
 */
function buildQuestions(deck, pool, progress) {
  const picked = pickSession(deck.items, progress, QUIZ_SIZE);
  return picked.map((sign) => {
    const correct = answerOf(sign);
    const sameDeck = deck.items.map(answerOf).filter((a) => a !== correct);
    const extra = pool.map(answerOf).filter((a) => a !== correct && !sameDeck.includes(a));
    const distractors = [...shuffle([...new Set(sameDeck)]), ...shuffle([...new Set(extra)])].slice(0, OPTIONS - 1);
    return { sign, correct, options: shuffle([correct, ...distractors]) };
  });
}

function Quiz({ deck, pool }) {
  const { openSign } = useApp();
  const { progress, update } = useProgress();
  const [questions, setQuestions] = useState(() => buildQuestions(deck, pool, progress));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const headingRef = useRef(null);
  const nextRef = useRef(null);

  const done = index >= questions.length;
  const q = questions[index];
  const answered = chosen !== null;
  const isCorrect = answered && chosen === q?.correct;
  const score = questions.length - mistakes.length;
  const points = index + (answered ? 1 : 0) - mistakes.length;

  // Nowe pytanie → fokus na nagłówek pytania; po odpowiedzi → na „Dalej”.
  useEffect(() => {
    if (!done && index > 0) headingRef.current?.focus({ preventScroll: true });
  }, [index, done]);
  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  const answer = (option) => {
    if (answered) return;
    setChosen(option);
    const ok = option === q.correct;
    update((p) => grade(p, itemKey(q.sign), ok ? 'good' : 'again'));
    if (!ok) setMistakes((m) => [...m, { sign: q.sign, chosen: option }]);
  };

  const next = () => {
    setChosen(null);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setQuestions(buildQuestions(deck, pool, progress));
    setIndex(0);
    setChosen(null);
    setMistakes([]);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <SessionSummary
        title={`Wynik: ${score} / ${questions.length}`}
        lead={pct === 100 ? 'Bezbłędnie! Świetna robota.' : pct >= 70 ? `${pct}% — bardzo dobrze.` : `${pct}% — warto powtórzyć te znaki w fiszkach.`}
        stats={[
          { label: 'Poprawne', value: score },
          { label: 'Błędne', value: mistakes.length },
          { label: 'Wynik', value: `${pct}%` },
        ]}
        onRestart={restart}
        restartLabel="Nowy quiz"
        altHref={`#/nauka/fiszki/${deck.id}`}
        altLabel="Ćwicz w fiszkach"
      >
        {mistakes.length > 0 && (
          <div className="mistakes">
            <h2 className="mistakes__title">Do powtórki</h2>
            <ul className="mistakes__list">
              {mistakes.map((m) => (
                <li key={itemKey(m.sign)}>
                  <button type="button" className="mistakes__row" onClick={() => openSign(m.sign.id)} aria-haspopup="dialog">
                    <span className="mistakes__correct">{answerOf(m.sign)}</span>
                    <span className="mistakes__chosen">Twoja odpowiedź: {m.chosen}</span>
                    <span className="mistakes__open">Zobacz znak <IconArrow aria-hidden="true" /></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SessionSummary>
    );
  }

  const isLetter = q.sign.category === 'alfabet';

  return (
    <>
      <SessionHeader mode="Quiz" title={deck.title} current={index} total={questions.length}>
        <p className="session-head__score">
          <span className="session-head__score-num">{points}</span> pkt
        </p>
      </SessionHeader>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          className="quiz"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease }}
        >
          <div className="quiz__media">
            <VideoPlayer src={q.sign.video} fileName={q.sign.videoFile} title="do rozpoznania" />
          </div>

          <div className="quiz__panel">
            <h2 ref={headingRef} tabIndex={-1} className="quiz__question">
              {isLetter ? 'Jaką literę pokazuje nagranie?' : 'Co oznacza ten znak?'}
            </h2>

            <div className="quiz__options" role="group" aria-label="Odpowiedzi">
              {q.options.map((opt, i) => {
                const state = !answered ? '' : opt === q.correct ? ' is-correct' : opt === chosen ? ' is-wrong' : ' is-dim';
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`option${state}`}
                    onClick={() => answer(opt)}
                    aria-disabled={answered}
                  >
                    <span className="option__key" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                    <span className="option__text">{opt}</span>
                    {answered && opt === q.correct && (
                      <>
                        <IconCheck className="option__icon" aria-hidden="true" />
                        <span className="visually-hidden"> — poprawna odpowiedź</span>
                      </>
                    )}
                    {answered && opt === chosen && opt !== q.correct && (
                      <>
                        <IconClose className="option__icon" aria-hidden="true" />
                        <span className="visually-hidden"> — Twoja odpowiedź, błędna</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="quiz__feedback" role="status">
              {answered && (isCorrect ? 'Dobrze! ' : `Niestety. Poprawna odpowiedź: ${q.correct}. `)}
            </p>

            {answered && (
              <button ref={nextRef} type="button" className="btn btn--wide" onClick={next}>
                {index + 1 < questions.length ? 'Następne pytanie' : 'Zobacz wynik'} <IconArrow aria-hidden="true" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function QuizSession({ deckId }) {
  const data = useData();

  if (data.status === 'loading') {
    return <div className="container"><LoadingState variant="signs" count={4} label="Ładowanie quizu…" /></div>;
  }
  if (data.status === 'error') {
    return <div className="container session"><ErrorState error={data.error} onRetry={data.retry} /></div>;
  }

  const deck = findDeck(data, deckId);
  if (!deck) return <NotFound />;
  const pool = deck.id === 'alfabet' ? data.alphabet : data.signs;

  if (new Set(pool.map(answerOf)).size < 2) {
    return (
      <div className="container session">
        <p className="empty">Za mało znaków, aby ułożyć quiz. Dodaj więcej znaków do słownika.</p>
      </div>
    );
  }

  return (
    <div className="container session">
      <Quiz key={deck.id} deck={deck} pool={pool} />
    </div>
  );
}
