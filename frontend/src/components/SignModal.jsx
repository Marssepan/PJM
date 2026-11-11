import { useEffect, useId, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../state/AppContext.jsx';
import { useData } from '../state/DataContext.jsx';
import useFocusTrap from '../hooks/useFocusTrap.js';
import VideoPlayer from './VideoPlayer.jsx';
import { IconArrow, IconBack, IconClose } from './Icons.jsx';

const ease = [0.22, 1, 0.36, 1];

/** Zamienia znak w otwartym oknie bez dokładania wpisu w historii — „Wstecz” nadal zamyka okno. */
function replaceSign(id) {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const params = new URLSearchParams(qs);
  params.set('znak', id);
  window.location.replace(`#${path}?${params.toString()}`);
}

export default function SignModal({ sign }) {
  const { closeSign } = useApp();
  const { alphabet, signs, categoriesById } = useData();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const uid = useId();
  const titleId = `${uid}-tytul`;
  const descId = `${uid}-opis`;

  useFocusTrap(dialogRef);

  const isLetter = sign.category === 'alfabet';
  const siblings = useMemo(
    () => (isLetter ? alphabet : signs.filter((s) => s.category === sign.category)),
    [isLetter, sign.category, alphabet, signs],
  );
  const index = siblings.findIndex((s) => s.id === sign.id);
  const prev = siblings[(index - 1 + siblings.length) % siblings.length];
  const next = siblings[(index + 1) % siblings.length];
  const groupName = isLetter ? 'Alfabet PJM' : categoriesById[sign.category]?.name;

  useEffect(() => {
    closeRef.current?.focus();
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeSign();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSign]);

  return (
    <div className="modal" role="presentation">
      <motion.div
        className="modal__backdrop"
        aria-hidden="true"
        onClick={closeSign}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease }}
      />
      <motion.div
        ref={dialogRef}
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        initial={{ opacity: 0, y: 32, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.985 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="modal__bar">
          <p className="eyebrow">{groupName}</p>
          <button ref={closeRef} type="button" className="icon-btn" onClick={closeSign} aria-label="Zamknij szczegóły znaku">
            <IconClose aria-hidden="true" />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={sign.id}
            className="modal__body"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease }}
          >
            <VideoPlayer src={sign.video} fileName={sign.videoFile} title={sign.name} describedBy={descId} />

            <div className="modal__text">
              <h2 id={titleId} className="modal__title">{sign.name}</h2>
              {sign.meaning && <p className="modal__meaning" lang="en">{sign.meaning}</p>}
              <p id={descId} className="modal__desc">{sign.description || 'Brak opisu.'}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {siblings.length > 1 && (
          <nav className="modal__pager" aria-label={`Inne znaki: ${groupName}`}>
            <button type="button" className="pager-btn" onClick={() => replaceSign(prev.id)}>
              <IconBack aria-hidden="true" />
              <span><span className="visually-hidden">Poprzedni znak: </span>{prev.name}</span>
            </button>
            <span className="modal__count" aria-hidden="true">
              {String(index + 1).padStart(2, '0')} / {String(siblings.length).padStart(2, '0')}
            </span>
            <button type="button" className="pager-btn pager-btn--next" onClick={() => replaceSign(next.id)}>
              <span><span className="visually-hidden">Następny znak: </span>{next.name}</span>
              <IconArrow aria-hidden="true" />
            </button>
          </nav>
        )}
      </motion.div>
    </div>
  );
}
