import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Litery alfabetu palcowego PJM wykonywane z ruchem dłoni (znaki dynamiczne).
 * Powszechny opis daktylografii PJM: litery podstawowe to statyczne układy dłoni,
 * litery ze znakami diakrytycznymi = układ litery bazowej + ruch.
 * ⚠ Do weryfikacji z certyfikowanym lektorem PJM przed publikacją — edytuj tylko ten zbiór.
 */
const MOVING_LETTERS = new Set<string>(['Ą', 'Ć', 'Ę', 'J', 'Ł', 'Ń', 'Ó', 'Ś', 'Ź', 'Ż']);

async function main() {
  console.log('Czyszczenie bazy danych...');
  await prisma.sign.deleteMany();
  await prisma.category.deleteMany();
  await prisma.alphabet.deleteMany();

  console.log('Tworzenie kategorii...');
  const podstawy = await prisma.category.create({ data: { name: 'Podstawowe zwroty', slug: 'podstawy' } });
  const rodzina = await prisma.category.create({ data: { name: 'Rodzina', slug: 'rodzina' } });
  const emocje = await prisma.category.create({ data: { name: 'Emocje i stany', slug: 'emocje' } });
  const czas = await prisma.category.create({ data: { name: 'Czas i kalendarz', slug: 'czas' } });
  const uczelnia = await prisma.category.create({ data: { name: 'Edukacja i uczelnia', slug: 'uczelnia' } });

  console.log('Dodawanie słownika PJM...');
  const signs = await prisma.sign.createMany({
    data: [
      // Podstawy
      { name: 'Dzień dobry', description: 'Uniwersalne powitanie.', video_url: 'podstawy_dzien_dobry.mp4', category_id: podstawy.id },
      { name: 'Do widzenia', description: 'Pożegnanie.', video_url: 'podstawy_do_widzenia.mp4', category_id: podstawy.id },
      { name: 'Proszę', description: 'Używane przy prośbach i podawaniu.', video_url: 'podstawy_prosze.mp4', category_id: podstawy.id },
      { name: 'Dziękuję', description: 'Wyrażenie wdzięczności.', video_url: 'podstawy_dziekuje.mp4', category_id: podstawy.id },
      { name: 'Przepraszam', description: 'Używane do przeprosin lub zwrócenia uwagi.', video_url: 'podstawy_przepraszam.mp4', category_id: podstawy.id },
      { name: 'Tak', description: 'Twierdzenie.', video_url: 'podstawy_tak.mp4', category_id: podstawy.id },
      { name: 'Nie', description: 'Przeczenie.', video_url: 'podstawy_nie.mp4', category_id: podstawy.id },
      
      // Rodzina
      { name: 'Mama', description: 'Matka.', video_url: 'rodzina_mama.mp4', category_id: rodzina.id },
      { name: 'Tata', description: 'Ojciec.', video_url: 'rodzina_tata.mp4', category_id: rodzina.id },
      { name: 'Brat', description: 'Rodzeństwo męskie.', video_url: 'rodzina_brat.mp4', category_id: rodzina.id },
      { name: 'Siostra', description: 'Rodzeństwo żeńskie.', video_url: 'rodzina_siostra.mp4', category_id: rodzina.id },
      { name: 'Babcia', description: 'Matka jednego z rodziców.', video_url: 'rodzina_babcia.mp4', category_id: rodzina.id },
      { name: 'Dziadek', description: 'Ojciec jednego z rodziców.', video_url: 'rodzina_dziadek.mp4', category_id: rodzina.id },

      // Emocje
      { name: 'Radość', description: 'Stan szczęścia, zadowolenia.', video_url: 'emocje_radosc.mp4', category_id: emocje.id },
      { name: 'Smutek', description: 'Stan przygnębienia.', video_url: 'emocje_smutek.mp4', category_id: emocje.id },
      { name: 'Złość', description: 'Silna irytacja.', video_url: 'emocje_zlosc.mp4', category_id: emocje.id },
      { name: 'Strach', description: 'Obawa przed zagrożeniem.', video_url: 'emocje_strach.mp4', category_id: emocje.id },
      { name: 'Zmęczenie', description: 'Brak sił, wyczerpanie.', video_url: 'emocje_zmeczenie.mp4', category_id: emocje.id },

      // Czas
      { name: 'Dzisiaj', description: 'Bieżący dzień.', video_url: 'czas_dzisiaj.mp4', category_id: czas.id },
      { name: 'Jutro', description: 'Dzień po dzisiejszym.', video_url: 'czas_jutro.mp4', category_id: czas.id },
      { name: 'Wczoraj', description: 'Dzień przed dzisiejszym.', video_url: 'czas_wczoraj.mp4', category_id: czas.id },
      { name: 'Godzina', description: 'Jednostka czasu.', video_url: 'czas_godzina.mp4', category_id: czas.id },
      { name: 'Rok', description: 'Okres 12 miesięcy.', video_url: 'czas_rok.mp4', category_id: czas.id },

      // Uczelnia i Edukacja
      { name: 'Inżynier', description: 'Tytuł zawodowy po studiach technicznych.', video_url: 'uczelnia_inzynier.mp4', category_id: uczelnia.id },
      { name: 'Projekt', description: 'Zadanie realizowane w określonym czasie.', video_url: 'uczelnia_projekt.mp4', category_id: uczelnia.id },
      { name: 'Wykład', description: 'Zajęcia teoretyczne prowadzone przez wykładowcę.', video_url: 'uczelnia_wyklad.mp4', category_id: uczelnia.id },
      { name: 'Egzamin', description: 'Sprawdzian wiedzy.', video_url: 'uczelnia_egzamin.mp4', category_id: uczelnia.id },
      { name: 'Dziekanat', description: 'Biuro obsługi studentów.', video_url: 'uczelnia_dziekanat.mp4', category_id: uczelnia.id },
    ],
  });

  console.log('Dodawanie alfabetu PJM...');
  const polishAlphabet = [
    'A', 'Ą', 'B', 'C', 'Ć', 'D', 'E', 'Ę', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'Ł', 
    'M', 'N', 'Ń', 'O', 'Ó', 'P', 'R', 'S', 'Ś', 'T', 'U', 'W', 'Y', 'Z', 'Ź', 'Ż'
  ];

  // Literówka w MOVING_LETTERS → przerwij seed zamiast cicho zapisać złe dane.
  const unknown = [...MOVING_LETTERS].filter((l) => !polishAlphabet.includes(l));
  if (unknown.length) throw new Error(`MOVING_LETTERS zawiera nieznane litery: ${unknown.join(', ')}`);

  const alphabetData = polishAlphabet.map((letter) => ({
    letter,
    video_url: `alfabet_${letter.toLowerCase()}.mp4`,
    requiresMovement: MOVING_LETTERS.has(letter),
  }));

  await prisma.alphabet.createMany({
    data: alphabetData,
  });

  const moving = alphabetData.filter((a) => a.requiresMovement).length;
  console.log(
    `✅ Baza zasilona: ${signs.count} znaków, ${polishAlphabet.length} liter ` +
      `(${moving} z ruchem, ${polishAlphabet.length - moving} statycznych).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });