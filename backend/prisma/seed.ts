import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Litery alfabetu palcowego PJM wykonywane z ruchem dłoni (znaki dynamiczne).
 * Powszechny opis daktylografii PJM: litery podstawowe to statyczne układy dłoni,
 * litery ze znakami diakrytycznymi = układ litery bazowej + ruch.
 * ⚠ Do weryfikacji z certyfikowanym lektorem PJM przed publikacją — edytuj tylko ten zbiór.
 */
const MOVING_LETTERS = new Set<string>(['Ą', 'Ć', 'Ę', 'J', 'Ł', 'Ń', 'Ó', 'Ś', 'Ź', 'Ż']);

/**
 * Feature 2 — opisy ułożenia dłoni (daktylologia PJM). Treść zweryfikowana przez autora projektu.
 * Litery bez wpisu mają handshape = null — interfejs pokazuje wtedy „Opis w przygotowaniu”.
 */
const ALPHABET_HANDSHAPES: Record<string, string> = {
  A: 'Dłoń zwinięta w pięść, kciuk wyprostowany i przylegający z boku do palca wskazującego.',
  B: 'Dłoń otwarta, palce wyprostowane i złączone, kciuk zgięty, przylega do wnętrza dłoni.',
  C: 'Palce zgięte w łuk, tworzą kształt litery C.',
  Ć: 'Palce zgięte w łuk (jak C), dłoń wykonuje krótki ruch w dół.',
  D: 'Palec wskazujący wyprostowany skierowany w górę, reszta palców złączona z kciukiem, tworząc kółko.',
  E: 'Dłoń ułożona płasko, palce zgięte pod kątem prostym w stawach, kciuk przylega do boku dłoni.',
  L: 'Kciuk i palec wskazujący wyprostowane, tworzą kształt litery L, reszta palców zwinięta w pięść.',
  Ł: 'Ułożenie jak przy literze L, ale dłoń wykonuje krótki ruch w dół i w bok.',
  O: 'Palce i kciuk złączone opuszkami, tworzą okrąg (kształt litery O).',
  P: 'Kciuk i palec wskazujący wyprostowane, dłoń ułożona poziomo, palec wskazujący wskazuje w lewo (dla praworęcznych).',
};

/**
 * Feature 3 — mimika (niemanualne elementy znaku) dla kategorii „Emocje”.
 * Klucz = nazwa znaku w słowniku. Treść zweryfikowana przez autora projektu.
 */
const FACIAL_EXPRESSIONS: Record<string, string> = {
  Radość:
    'Szeroki, naturalny uśmiech, rozluźnione mięśnie twarzy, oczy lekko zmrużone, brwi w naturalnej pozycji lub lekko uniesione.',
  Smutek:
    'Kąciki ust skierowane w dół, brwi ściągnięte i lekko opuszczone, wzrok często skierowany w dół, głowa lekko pochylona.',
  Złość:
    'Brwi mocno ściągnięte i zmarszczone, usta zaciśnięte w wąską linię, napięte mięśnie twarzy, wzrok ostry i skupiony.',
  Zdziwienie:
    'Szeroko otwarte oczy, brwi wysoko uniesione, usta otwarte (często w kształt litery O), głowa lekko cofnięta.',
  Strach:
    'Szeroko otwarte oczy, brwi uniesione i ściągnięte do siebie, usta lekko otwarte z napiętymi kącikami, cała twarz napięta.',
};

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
  const signRows = [
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
      { name: 'Zdziwienie', description: 'Reakcja na coś nieoczekiwanego.', video_url: 'emocje_zdziwienie.mp4', category_id: emocje.id },
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
  ];

  // Literówka w kluczu FACIAL_EXPRESSIONS → przerwij seed zamiast cicho pominąć opis.
  const signNames = new Set(signRows.map((s) => s.name));
  const unknownSigns = Object.keys(FACIAL_EXPRESSIONS).filter((n) => !signNames.has(n));
  if (unknownSigns.length) throw new Error(`FACIAL_EXPRESSIONS: brak znaków ${unknownSigns.join(', ')}`);

  const signs = await prisma.sign.createMany({
    data: signRows.map((s) => ({ ...s, facialExpression: FACIAL_EXPRESSIONS[s.name] ?? null })),
  });

  console.log('Dodawanie alfabetu PJM...');
  const polishAlphabet = [
    'A', 'Ą', 'B', 'C', 'Ć', 'D', 'E', 'Ę', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'Ł', 
    'M', 'N', 'Ń', 'O', 'Ó', 'P', 'R', 'S', 'Ś', 'T', 'U', 'W', 'Y', 'Z', 'Ź', 'Ż'
  ];

  // Literówka w MOVING_LETTERS → przerwij seed zamiast cicho zapisać złe dane.
  const unknown = [...MOVING_LETTERS, ...Object.keys(ALPHABET_HANDSHAPES)].filter((l) => !polishAlphabet.includes(l));
  if (unknown.length) throw new Error(`Nieznane litery w MOVING_LETTERS / ALPHABET_HANDSHAPES: ${unknown.join(', ')}`);

  const alphabetData = polishAlphabet.map((letter, index) => ({
    letter,
    video_url: `alfabet_${letter.toLowerCase()}.mp4`,
    requiresMovement: MOVING_LETTERS.has(letter),
    handshape: ALPHABET_HANDSHAPES[letter] ?? null,
    sortOrder: index + 1,
  }));

  await prisma.alphabet.createMany({
    data: alphabetData,
  });

  const moving = alphabetData.filter((a) => a.requiresMovement).length;
  const described = alphabetData.filter((a) => a.handshape).length;
  const withFace = Object.keys(FACIAL_EXPRESSIONS).length;
  console.log(
    `✅ Baza zasilona: ${signs.count} znaków, ${polishAlphabet.length} liter ` +
      `(${moving} z ruchem, ${polishAlphabet.length - moving} statycznych).`,
  );
  console.log(
    `   Opisy dłoni: ${described}/${polishAlphabet.length} liter · mimika: ${withFace} znaków.`,
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