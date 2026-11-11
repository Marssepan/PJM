import { useEffect, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useApp } from './state/AppContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SignModal from './components/SignModal.jsx';
import Home from './pages/Home.jsx';
import Category from './pages/Category.jsx';
import Dictionary from './pages/Dictionary.jsx';
import Alphabet from './pages/Alphabet.jsx';
import SearchResults from './pages/SearchResults.jsx';
import NotFound from './pages/NotFound.jsx';
import { useData } from './state/DataContext.jsx';

const ease = [0.22, 1, 0.36, 1];

function resolve(path, data) {
  if (path === '/') return { key: 'home', title: 'Start', el: <Home /> };
  if (path === '/slownik') return { key: 'slownik', title: 'Słownik', el: <Dictionary /> };
  if (path === '/alfabet') return { key: 'alfabet', title: 'Alfabet PJM', el: <Alphabet /> };
  if (path === '/szukaj') return { key: 'szukaj', title: 'Wyniki wyszukiwania', el: <SearchResults /> };
  const m = path.match(/^\/kategoria\/([\w-]+)$/);
  // Podczas ładowania/błędu nie wiemy jeszcze, czy kategoria istnieje — decyduje strona Category.
  if (m && (data.status !== 'ready' || data.categoriesById[m[1]])) {
    const title = data.categoriesById[m[1]]?.name ?? 'Kategoria';
    return { key: `kat-${m[1]}`, title, el: <Category id={m[1]} /> };
  }
  return { key: '404', title: 'Nie znaleziono', el: <NotFound /> };
}

export default function App() {
  const { route, activeSignId } = useApp();
  const data = useData();
  const page = resolve(route.path, data);
  const activeSign = activeSignId && data.status === 'ready' ? data.findById(activeSignId) : null;
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // Tytuł dokumentu + przeniesienie fokusu na treść po zmianie widoku (WCAG 2.4.2, 2.4.3).
  useEffect(() => {
    document.title = `${page.title} — PJM`;
  }, [page.title]);

  // Fokus tylko przy zmianie widoku — nie przy doładowaniu danych z API.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [page.key]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#tresc" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>
        Przejdź do treści
      </a>
      <Header />
      <main id="tresc" ref={mainRef} tabIndex={-1} className="main" aria-label={page.title}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={page.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease }}
          >
            {page.el}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <AnimatePresence>{activeSign && <SignModal key="sign-modal" sign={activeSign} />}</AnimatePresence>
    </MotionConfig>
  );
}
