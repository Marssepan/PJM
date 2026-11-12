import { motion } from 'framer-motion';
import { useApp } from '../state/AppContext.jsx';
import { useData } from '../state/DataContext.jsx';
import { IconArrow } from './Icons.jsx';
import { ease } from '../styles/motion.js';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

export function SignCard({ sign, showCategory = false }) {
  const { openSign } = useApp();
  const { categoriesById } = useData();
  return (
    <button type="button" className="sign-card" onClick={() => openSign(sign.id)} aria-haspopup="dialog">
      <span className="sign-card__name">{sign.name}</span>
      {sign.description && <span className="sign-card__meaning">{sign.description}</span>}
      {showCategory && <span className="sign-card__meta">{categoriesById[sign.category]?.name}</span>}
      <IconArrow className="sign-card__arrow" aria-hidden="true" />
    </button>
  );
}

export default function SignGrid({ signs, showCategory = false, label }) {
  return (
    <motion.ul className="sign-grid" aria-label={label} variants={container} initial="hidden" animate="show">
      {signs.map((s) => (
        <motion.li key={s.id} variants={item}>
          <SignCard sign={s} showCategory={showCategory} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
