import { motion } from 'framer-motion';
import { useApp } from '../state/AppContext.jsx';
import SearchBox from './SearchBox.jsx';

const links = [
  { path: '/', label: 'Start', match: (p) => p === '/' || p.startsWith('/kategoria') },
  { path: '/slownik', label: 'Słownik', match: (p) => p === '/slownik' },
  { path: '/alfabet', label: 'Alfabet', match: (p) => p === '/alfabet' },
];

export default function Header() {
  const { route } = useApp();

  return (
    <header className="header">
      <div className="header__inner container">
        <a href="#/" className="brand" aria-label="PJM — strona główna">
          <span className="brand__mark" aria-hidden="true">PJM</span>
          <span className="brand__text">Polski Język Migowy</span>
        </a>

        <nav className="nav" aria-label="Główna">
          <ul className="nav__list">
            {links.map((l) => {
              const current = l.match(route.path);
              return (
                <li key={l.path}>
                  <a href={`#${l.path}`} className="nav__link" aria-current={current ? 'page' : undefined}>
                    {l.label}
                    {current && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="nav__indicator"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <SearchBox />
      </div>
    </header>
  );
}
