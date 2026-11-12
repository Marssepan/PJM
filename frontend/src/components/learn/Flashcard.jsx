import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import VideoPlayer from '../VideoPlayer.jsx';
import SignDetails from '../SignDetails.jsx';
import { answerOf } from '../../learn/decks.js';
import { duration, ease } from '../../styles/motion.js';


/**
 * Fiszka z animacją 3D (rotateY + backface-visibility).
 * – direction 'sign-to-word': przód = nagranie, tył = słowo + opis
 * – direction 'word-to-sign': przód = słowo, tył = nagranie + opis
 * Niewidoczna strona ma `inert` + aria-hidden → klawiatura i czytnik ekranu widzą tylko jedną stronę.
 * Przy prefers-reduced-motion obrót zastępuje płynne przenikanie.
 */
export default function Flashcard({ sign, flipped, direction }) {
  const reduce = useReducedMotion();
  const backHeadingRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [backMounted, setBackMounted] = useState(false);

  // Tył renderujemy dopiero przy pierwszym odwróceniu — wideo na tyle nie gra „w ukryciu”.
  useEffect(() => {
    if (flipped) setBackMounted(true);
  }, [flipped]);

  // `inert` ustawiany przez DOM — działa tak samo w React 18 i 19 (różnie traktują ten atrybut w JSX).
  useEffect(() => {
    if (frontRef.current) frontRef.current.inert = flipped;
    if (backRef.current) backRef.current.inert = !flipped;
  }, [flipped, reduce]);

  // Po odwróceniu fokus na nagłówek tyłu → czytnik ekranu od razu czyta odpowiedź.
  useEffect(() => {
    if (!flipped) return undefined;
    const t = setTimeout(() => backHeadingRef.current?.focus({ preventScroll: true }), reduce ? 0 : 350);
    return () => clearTimeout(t);
  }, [flipped, reduce]);

  const answer = answerOf(sign);
  const isLetter = sign.category === 'alfabet';
  const videoFirst = direction === 'sign-to-word';

  const wordFace = (headingRef) => (
    <div className="flash__word">
      <p className="eyebrow">{videoFirst ? 'Odpowiedź' : isLetter ? 'Jak pokazać literę?' : 'Jak pokazać ten znak?'}</p>
      <h2 ref={headingRef} className="flash__answer" tabIndex={headingRef ? -1 : undefined}>{answer}</h2>
      {videoFirst && (
        <>
          {sign.description && <p className="flash__desc">{sign.description}</p>}
          <SignDetails sign={sign} />
        </>
      )}
    </div>
  );

  const videoFace = (headingRef) => (
    <div className="flash__video">
      {headingRef ? (
        <h2 ref={headingRef} className="flash__label" tabIndex={-1}>
          Odpowiedź: <span className="flash__label-strong">{answer}</span>
        </h2>
      ) : (
        <p className="flash__label">{isLetter ? 'Jaka to litera?' : 'Co oznacza ten znak?'}</p>
      )}
      <VideoPlayer src={sign.video} fileName={sign.videoFile} title={videoFirst ? 'do rozpoznania' : answer} />
      {!videoFirst && <SignDetails sign={sign} />}
    </div>
  );

  const front = videoFirst ? videoFace(null) : wordFace(null);
  const back = backMounted ? (videoFirst ? wordFace(backHeadingRef) : videoFace(backHeadingRef)) : null;

  if (reduce) {
    return (
      <div className="flash flash--fade">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={flipped ? 'back' : 'front'}
            className="flash__face"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {flipped ? back : front}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flash">
      <motion.div
        className="flash__inner"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: duration.flip, ease }}
      >
        <div ref={frontRef} className="flash__face flash__face--front" aria-hidden={flipped}>
          {front}
        </div>
        <div ref={backRef} className="flash__face flash__face--back" aria-hidden={!flipped}>
          {back}
        </div>
      </motion.div>
    </div>
  );
}
