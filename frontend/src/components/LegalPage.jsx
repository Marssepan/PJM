import { motion } from 'framer-motion';
import { site } from '../config/site.js';
import { ease } from '../styles/motion.js';


function formatDate(iso) {
  return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

/**
 * Wspólny układ stron prawnych: nagłówek, spis treści, numerowane sekcje.
 * Spis treści używa przycisków (nie kotwic #id) — kotwice kolidowałyby z hash-routerem.
 *
 * @param {{ eyebrow: string, title: string, intro: React.ReactNode,
 *           sections: { id: string, title: string, body: React.ReactNode }[] }} props
 */
export default function LegalPage({ eyebrow, title, intro, sections }) {
  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-lead">
          Ostatnia aktualizacja: <time dateTime={site.legalUpdated}>{formatDate(site.legalUpdated)}</time>
        </p>
      </header>

      <div className="legal">
        <nav className="legal__toc" aria-label="Spis treści">
          <p className="eyebrow">Spis treści</p>
          <ol>
            {sections.map((s, i) => (
              <li key={s.id}>
                <button type="button" className="legal__toc-link" onClick={() => jump(s.id)}>
                  <span className="legal__toc-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal__body">
          <div className="legal__intro">{intro}</div>

          {sections.map((s, i) => (
            <motion.section
              key={s.id}
              className="legal__section"
              aria-labelledby={s.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.45, ease }}
            >
              <h2 id={s.id} className="legal__heading" tabIndex={-1}>
                <span className="legal__num" aria-hidden="true">§ {i + 1}</span>
                {s.title}
              </h2>
              <div className="legal__content">{s.body}</div>
            </motion.section>
          ))}

          <p className="legal__note">
            Pytania dotyczące tego dokumentu: <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </article>
      </div>
    </div>
  );
}
