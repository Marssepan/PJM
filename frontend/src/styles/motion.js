/**
 * Motion tokens — jedno źródło prawdy dla Framer Motion.
 * Krzywa „z wagą”: szybki start, długie, miękkie wyhamowanie — bez sprężynowania (jak arkusze w iOS).
 * Ten sam przebieg w CSS: --ease w global.css.
 */
export const ease = [0.32, 0.72, 0, 1];

export const duration = {
  fast: 0.22, // podpowiedzi, drobne stany
  base: 0.45, // karty, sekcje
  slow: 0.6, // modal, przejścia stron
  flip: 0.8, // fiszka 3D
};

/** Domyślne przejście dla <MotionConfig>. */
export const transition = { duration: duration.base, ease };
