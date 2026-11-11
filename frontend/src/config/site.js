/**
 * Dane właściciela serwisu — używane w stopce, Polityce prywatności i Regulaminie.
 * ⚠ UZUPEŁNIJ przed publikacją. Zmiana tutaj aktualizuje wszystkie strony naraz.
 */
export const site = {
  name: 'PJM — Polski Język Migowy',
  shortName: 'PJM',
  url: 'https://marssepan.github.io/PJM/',

  /** Administrator danych / Usługodawca (osoba fizyczna). */
  owner: '[Imię i nazwisko]',
  email: '[adres e-mail kontaktowy]',

  /** Kontekst projektu. */
  project: 'projekt inżynierski realizowany w [nazwa uczelni]',

  /** Data ostatniej aktualizacji dokumentów (RRRR-MM-DD). */
  legalUpdated: '2026-11-11',

  /** Dostawcy infrastruktury — wymienieni w Polityce prywatności. */
  providers: [
    { name: 'GitHub, Inc. (GitHub Pages)', role: 'hosting strony i nagrań wideo', country: 'USA' },
    { name: 'Vercel Inc.', role: 'hosting interfejsu API', country: 'USA' },
    { name: 'Neon Inc.', role: 'baza danych z treścią słownika (region: Frankfurt, UE)', country: 'USA / UE' },
  ],
};
