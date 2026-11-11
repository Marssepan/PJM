import { useData } from '../state/DataContext.jsx';
import SignGrid from '../components/SignGrid.jsx';
import { ErrorState, LoadingHead, LoadingState } from '../components/StatusViews.jsx';
import { IconBack } from '../components/Icons.jsx';
import NotFound from './NotFound.jsx';

const collator = new Intl.Collator('pl');

function BackLink() {
  return (
    <a href="#/" className="link-back">
      <IconBack aria-hidden="true" /> Wszystkie kategorie
    </a>
  );
}

export default function Category({ id }) {
  const { status, error, retry, categories, categoriesById, signs } = useData();

  if (status === 'loading') {
    return (
      <div className="container">
        <div className="page-head page-head--tight"><BackLink /></div>
        <LoadingHead />
        <LoadingState variant="signs" label="Ładowanie znaków…" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container">
        <header className="page-head">
          <BackLink />
          <h1 className="page-title">Kategoria</h1>
        </header>
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  const category = categoriesById[id];
  if (!category) return <NotFound />;

  const items = signs.filter((s) => s.category === id).sort((a, b) => collator.compare(a.name, b.name));
  const position = categories.findIndex((c) => c.id === id) + 1;

  return (
    <div className="container">
      <header className="page-head">
        <BackLink />
        <p className="eyebrow">Kategoria {String(position).padStart(2, '0')}</p>
        <h1 className="page-title">{category.name}</h1>
        {category.description && <p className="page-lead">{category.description}</p>}
      </header>

      <nav aria-label="Kategorie" className="chips">
        <ul>
          {categories.map((c) => (
            <li key={c.id}>
              <a href={`#/kategoria/${c.id}`} className="chip" aria-current={c.id === id ? 'page' : undefined}>
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {items.length ? (
        <SignGrid signs={items} label={`Znaki: ${category.name}`} />
      ) : (
        <p className="empty">W tej kategorii nie ma jeszcze znaków.</p>
      )}
    </div>
  );
}
