import { motion } from 'framer-motion';
import { IconBack } from '../Icons.jsx';

/** Pasek sesji: powrót, tytuł, licznik i postęp sesji. */
export default function SessionHeader({ mode, title, current, total, children }) {
  const pct = total ? Math.min(100, (current / total) * 100) : 0;
  return (
    <header className="session-head">
      <a href="#/nauka" className="link-back">
        <IconBack aria-hidden="true" /> Strefa nauki
      </a>
      <div className="session-head__row">
        <div>
          <p className="eyebrow">{mode}</p>
          <h1 className="session-head__title">{title}</h1>
        </div>
        {children}
      </div>
      <div className="session-head__progress">
        <div
          className="pbar pbar--thin"
          role="progressbar"
          aria-label="Postęp sesji"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current}
          aria-valuetext={`${current} z ${total}`}
        >
          <motion.span className="pbar__fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <span className="session-head__count" aria-hidden="true">
          {String(Math.min(current + 1, total)).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </header>
  );
}
