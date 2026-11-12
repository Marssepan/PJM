import { motion } from 'framer-motion';
import { useData } from '../state/DataContext.jsx';
import { ErrorState, LoadingState } from '../components/StatusViews.jsx';
import { IconArrow } from '../components/Icons.jsx';
import { ease } from '../styles/motion.js';

const list = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } };

function signsLabel(n) {
  if (n === 1) return '1 znak';
  const m10 = n % 10;
  const m100 = n % 100;
  return `${n} ${m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'znaki' : 'znaków'}`;
}

export default function Home() {
  const { status, error, retry, categories, signs, alphabet, countByCategory } = useData();
  const ready = status === 'ready';

  return (
    <div className="container">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Polski Język Migowy</p>
        <h1 id="hero-title" className="hero__title">
          Język, który <span className="accent">widać</span>.
        </h1>
        <p className="hero__lead">
          Nauka PJM przez krótkie nagrania wideo. Spowalniaj, zapętlaj i powtarzaj każdy znak — w swoim tempie.
        </p>
        <dl className="stats" aria-busy={!ready}>
          {[
            ['Znaki', signs.length],
            ['Kategorie', categories.length],
            ['Litery', alphabet.length],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {ready ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    {value}
                  </motion.span>
                ) : status === 'error' ? (
                  <span className="stats__empty" aria-label="brak danych">—</span>
                ) : (
                  <span className="skeleton__line skeleton__line--stat" />
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="cat-title" className="section">
        <div className="section__head">
          <h2 id="cat-title" className="section__title">Kategorie</h2>
          <a href="#/slownik" className="link-arrow">
            Cały słownik <IconArrow aria-hidden="true" />
          </a>
        </div>

        {status === 'loading' && <LoadingState variant="categories" label="Ładowanie kategorii…" />}
        {status === 'error' && <ErrorState error={error} onRetry={retry} />}
        {ready && (
          <motion.ul className="cat-grid" variants={list} initial="hidden" animate="show">
            {categories.map((c, i) => (
              <motion.li key={c.id} variants={item}>
                <a href={`#/kategoria/${c.id}`} className="cat-card">
                  <span className="cat-card__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cat-card__name">{c.name}</span>
                  {c.description && <span className="cat-card__desc">{c.description}</span>}
                  <span className="cat-card__foot">
                    <span>{signsLabel(countByCategory[c.id] ?? 0)}</span>
                    <IconArrow aria-hidden="true" className="cat-card__arrow" />
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </section>

      <section className="section">
        <a href="#/alfabet" className="feature">
          <span>
            <span className="eyebrow">Fundament</span>
            <span className="feature__title">Alfabet palcowy PJM</span>
            <span className="feature__desc">
              Zacznij od daktylografii — pełny polski alfabet, łącznie z literami Ą, Ć, Ę, Ł, Ń, Ó, Ś, Ź, Ż.
            </span>
          </span>
          <span className="feature__letters" aria-hidden="true">A Ą B</span>
        </a>
      </section>
    </div>
  );
}
