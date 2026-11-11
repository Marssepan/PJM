/**
 * Talie do nauki budowane z danych już pobranych z API (DataContext) —
 * strefa nauki nie potrzebuje żadnych nowych endpointów.
 */

export const ALL_DECK = 'wszystko';
export const ALPHABET_DECK = 'alfabet';

/** Tekst odpowiedzi: dla liter sama litera, dla znaków nazwa. */
export const answerOf = (sign) => (sign.category === 'alfabet' ? sign.letter : sign.name);

export function getDecks({ categories, signs, alphabet }) {
  const decks = [
    { id: ALL_DECK, title: 'Wszystkie znaki', description: 'Mieszanka ze wszystkich kategorii.', items: signs },
    ...categories.map((c) => ({
      id: c.id,
      title: c.name,
      description: c.description,
      items: signs.filter((s) => s.category === c.id),
    })),
    { id: ALPHABET_DECK, title: 'Alfabet PJM', description: 'Litery alfabetu palcowego.', items: alphabet },
  ];
  return decks.filter((d) => d.items.length > 0);
}

export function findDeck(data, id) {
  return getDecks(data).find((d) => d.id === id) ?? null;
}
