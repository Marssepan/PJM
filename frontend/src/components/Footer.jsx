import { useApp } from '../state/AppContext.jsx';
import { site } from '../config/site.js';

const legalLinks = [
  { path: '/polityka-prywatnosci', label: 'Polityka prywatności' },
  { path: '/regulamin', label: 'Regulamin' },
];

export default function Footer() {
  const { route } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="brand__mark brand__mark--small" aria-hidden="true">{site.shortName}</span>
          <p>
            {site.name}
            <span className="footer__muted"> · projekt edukacyjny</span>
          </p>
        </div>

        <nav aria-label="Informacje prawne" className="footer__nav">
          <ul>
            {legalLinks.map((l) => (
              <li key={l.path}>
                <a
                  href={`#${l.path}`}
                  className="footer__link"
                  aria-current={route.path === l.path ? 'page' : undefined}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="footer__link">Kontakt</a>
            </li>
          </ul>
        </nav>

        <p className="footer__copy">© {year} {site.owner}</p>
      </div>
    </footer>
  );
}
