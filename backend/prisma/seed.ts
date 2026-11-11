/**
 * PJM Dictionary — seed
 * -----------------------------------------------------------------------------
 *   npm run db:seed
 *
 * 1. Słownik: czyści znaki i kategorie, tworzy 10 kategorii i 150 znaków.
 * 2. Alfabet: upsert po literze — NIE jest czyszczony, dane i ID liter zostają.
 *
 * Nazwy plików wideo generowane automatycznie: <slug-kategorii>_<nazwa-bez-polskich-znaków>.mp4
 *   „Szkoła” (edukacja)        → edukacja_szkola.mp4
 *   „Gdzie jest toaleta?”      → frazy_gdzie_jest_toaleta.mp4
 * Pełną listę wypisuje: npm run db:seed -- --list-videos
 */

import { PrismaClient, SignKind } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// Słownik: 10 kategorii, 150 znaków
// Format wpisu: [polska nazwa, angielskie tłumaczenie]
// `en` nie trafia jeszcze do bazy — przygotowane pod przyszłe pole `meaning`.
// =============================================================================
type Entry = readonly [pl: string, en: string];
type CategorySeed = {
  slug: string;
  name: string;
  description: string;
  kind: SignKind;
  signs: readonly Entry[];
};

const CATEGORIES: readonly CategorySeed[] = [
  {
    slug: 'edukacja',
    name: 'Edukacja',
    description: 'Szkoła, studia i nauka.',
    kind: 'WORD',
    signs: [
      ['szkoła', 'school'], ['student', 'student'], ['nauczyciel', 'teacher'], ['uniwersytet', 'university'],
      ['wykład', 'lecture'], ['egzamin', 'exam'], ['nauka', 'learning'], ['książka', 'book'],
      ['czytać', 'read'], ['pisać', 'write'], ['klasa', 'classroom'], ['przerwa', 'break'],
      ['tablica', 'board'], ['ocena', 'grade'], ['zaliczenie', 'pass'],
    ],
  },
  {
    slug: 'rodzina',
    name: 'Rodzina',
    description: 'Najbliżsi, krewni i relacje.',
    kind: 'WORD',
    signs: [
      ['mama', 'mother'], ['tata', 'father'], ['brat', 'brother'], ['siostra', 'sister'],
      ['babcia', 'grandmother'], ['dziadek', 'grandfather'], ['dziecko', 'child'], ['syn', 'son'],
      ['córka', 'daughter'], ['wujek', 'uncle'], ['ciocia', 'aunt'], ['mąż', 'husband'],
      ['żona', 'wife'], ['rodzice', 'parents'], ['przyjaciel', 'friend'], ['miłość', 'love'],
      ['chłopak', 'boyfriend'], ['dziewczyna', 'girlfriend'], ['ślub', 'wedding'], ['rodzina', 'family'],
    ],
  },
  {
    slug: 'emocje',
    name: 'Emocje',
    description: 'Uczucia i stany — tu mimika jest częścią znaku.',
    kind: 'WORD',
    signs: [
      ['radość', 'joy'], ['smutek', 'sadness'], ['złość', 'anger'], ['strach', 'fear'],
      ['stres', 'stress'], ['zmęczenie', 'tiredness'], ['spokój', 'calmness'], ['zaskoczenie', 'surprise'],
      ['nuda', 'boredom'], ['wstyd', 'shame'], ['duma', 'pride'], ['płacz', 'crying'],
      ['śmiech', 'laughter'], ['nerwowy', 'nervous'], ['szczęśliwy', 'happy'],
    ],
  },
  {
    slug: 'podstawy',
    name: 'Podstawowe zwroty',
    description: 'Powitania, pożegnania i zwroty grzecznościowe.',
    kind: 'WORD',
    signs: [
      ['dzień dobry', 'good morning'], ['do widzenia', 'goodbye'], ['dziękuję', 'thank you'], ['proszę', 'please'],
      ['przepraszam', 'sorry'], ['tak', 'yes'], ['nie', 'no'], ['cześć', 'hello'],
      ['dobranoc', 'goodnight'], ['witam', 'welcome'], ['smacznego', 'enjoy your meal'], ['na zdrowie', 'bless you'],
      ['gratulacje', 'congratulations'], ['pomoc', 'help'], ['nazywam się', 'my name is'],
    ],
  },
  {
    slug: 'czas',
    name: 'Czas i kalendarz',
    description: 'Pory dnia, dni tygodnia i określenia czasu.',
    kind: 'WORD',
    signs: [
      ['dzisiaj', 'today'], ['jutro', 'tomorrow'], ['wczoraj', 'yesterday'], ['rano', 'morning'],
      ['wieczór', 'evening'], ['dzień', 'day'], ['noc', 'night'], ['tydzień', 'week'],
      ['miesiąc', 'month'], ['rok', 'year'], ['poniedziałek', 'Monday'], ['wtorek', 'Tuesday'],
      ['środa', 'Wednesday'], ['czwartek', 'Thursday'], ['piątek', 'Friday'],
    ],
  },
  {
    slug: 'frazy',
    name: 'Codzienne frazy',
    description: 'Całe zdania przydatne na co dzień.',
    kind: 'PHRASE',
    signs: [
      ['jak się masz?', 'how are you?'], ['gdzie jest toaleta?', 'where is the toilet?'],
      ['która godzina?', 'what time is it?'], ['ile to kosztuje?', 'how much does it cost?'],
      ['nie rozumiem', "I don't understand"], ['proszę powtórzyć', 'please repeat'],
      ['co to znaczy?', 'what does this mean?'], ['potrzebuję pomocy', 'I need help'],
      ['skąd jesteś?', 'where are you from?'], ['nie wiem', "I don't know"],
      ['zgadzam się', 'I agree'], ['przepraszam za spóźnienie', "sorry I'm late"],
      ['czy możesz mi pomóc?', 'can you help me?'], ['mam pytanie', 'I have a question'],
      ['miło cię poznać', 'nice to meet you'],
    ],
  },
  {
    slug: 'praca',
    name: 'Praca i zawody',
    description: 'Miejsce pracy, zawody i finanse.',
    kind: 'WORD',
    signs: [
      ['praca', 'work'], ['biuro', 'office'], ['szef', 'boss'], ['lekarz', 'doctor'],
      ['pielęgniarka', 'nurse'], ['strażak', 'firefighter'], ['policjant', 'police officer'], ['kierowca', 'driver'],
      ['kucharz', 'chef'], ['sprzedawca', 'shop assistant'], ['pieniądze', 'money'], ['wypłata', 'salary'],
      ['zawód', 'profession'], ['spotkanie', 'meeting'], ['firma', 'company'],
    ],
  },
  {
    slug: 'miejsca',
    name: 'Miejsca',
    description: 'Dom, miasto i miejsca codziennego użytku.',
    kind: 'WORD',
    signs: [
      ['dom', 'home'], ['mieszkanie', 'apartment'], ['ulica', 'street'], ['miasto', 'city'],
      ['sklep', 'shop'], ['szpital', 'hospital'], ['restauracja', 'restaurant'], ['kino', 'cinema'],
      ['park', 'park'], ['łazienka', 'bathroom'], ['kuchnia', 'kitchen'], ['drzwi', 'door'],
      ['okno', 'window'], ['stół', 'table'], ['krzesło', 'chair'],
    ],
  },
  {
    slug: 'zdrowie',
    name: 'Zdrowie i ciało',
    description: 'Samopoczucie, części ciała i leczenie.',
    kind: 'WORD',
    signs: [
      ['zdrowy', 'healthy'], ['chory', 'sick'], ['ból', 'pain'], ['głowa', 'head'],
      ['ręka', 'hand/arm'], ['noga', 'leg'], ['serce', 'heart'], ['krew', 'blood'],
      ['lekarstwo', 'medicine'], ['apteka', 'pharmacy'], ['gorączka', 'fever'], ['kaszel', 'cough'],
      ['sen', 'sleep'], ['ząb', 'tooth'], ['oko', 'eye'],
    ],
  },
  {
    slug: 'technologia',
    name: 'Technologia i podstawy',
    description: 'Urządzenia, transport i podstawowe potrzeby.',
    kind: 'WORD',
    signs: [
      ['telefon', 'phone'], ['komputer', 'computer'], ['internet', 'internet'], ['telewizor', 'television'],
      ['samochód', 'car'], ['pociąg', 'train'], ['autobus', 'bus'], ['woda', 'water'],
      ['jedzenie', 'food'], ['pić', 'drink'],
    ],
  },
];

/** Oczekiwana liczba znaków — seed przerywa się, jeśli lista zostanie przypadkiem skrócona. */
const EXPECTED_SIGNS = 150;

/**
 * Mimika (Feature 3) — klucz = nazwa znaku z wielkiej litery.
 * Opis „Zdziwienie” z poprzedniej wersji przypisany do „Zaskoczenie” (surprise).
 */
const FACIAL_EXPRESSIONS: Record<string, string> = {
  Radość:
    'Szeroki, naturalny uśmiech, rozluźnione mięśnie twarzy, oczy lekko zmrużone, brwi w naturalnej pozycji lub lekko uniesione.',
  Smutek:
    'Kąciki ust skierowane w dół, brwi ściągnięte i lekko opuszczone, wzrok często skierowany w dół, głowa lekko pochylona.',
  Złość:
    'Brwi mocno ściągnięte i zmarszczone, usta zaciśnięte w wąską linię, napięte mięśnie twarzy, wzrok ostry i skupiony.',
  Zaskoczenie:
    'Szeroko otwarte oczy, brwi wysoko uniesione, usta otwarte (często w kształt litery O), głowa lekko cofnięta.',
  Strach:
    'Szeroko otwarte oczy, brwi uniesione i ściągnięte do siebie, usta lekko otwarte z napiętymi kącikami, cała twarz napięta.',
};

// =============================================================================
// Alfabet palcowy PJM (Feature 2) — zweryfikowane opisy
// =============================================================================
const ALPHABET: ReadonlyArray<[letter: string, handshape: string]> = [
  ['A', 'Dłoń zwinięta w pięść, kciuk przylega do boku palca wskazującego.'],
  ['Ą', 'Układ jak przy literze A, dłoń wykonuje krótki ruch po łuku w dół.'],
  ['B', 'Dłoń otwarta, palce wyprostowane i złączone, kciuk zgięty przylega do wnętrza dłoni.'],
  ['C', 'Palce i kciuk zgięte w łuk, tworzą kształt litery C.'],
  ['Ć', 'Układ jak przy literze C, dłoń wykonuje krótki ruch w dół.'],
  ['D', 'Palec wskazujący wyprostowany w górę, reszta palców złączona z kciukiem tworząc kółko.'],
  ['E', 'Dłoń płasko, palce zgięte pod kątem prostym w stawach, kciuk przy boku dłoni.'],
  ['Ę', 'Układ jak przy literze E, dłoń wykonuje krótki ruch po łuku w dół.'],
  ['F', 'Kciuk i palec wskazujący złączone opuszkami, pozostałe palce wyprostowane i rozchylone.'],
  ['G', 'Dłoń zwinięta w pięść, wyprostowany palec wskazujący i środkowy, złączone i skierowane w bok.'],
  ['H', 'Palec wskazujący i środkowy wyprostowane i rozchylone (tworzą literę V), reszta palców zaciśnięta.'],
  ['I', 'Dłoń zwinięta w pięść, wyprostowany tylko mały palec.'],
  ['J', 'Wyprostowany mały palec (jak I), dłoń rysuje w powietrzu kształt litery J.'],
  ['K', 'Dłoń otwarta, palec środkowy wysunięty do przodu, palec wskazujący skierowany w górę, kciuk oparty o palec środkowy (tzw. „pistolet” w górę).'],
  ['L', 'Kciuk i palec wskazujący wyprostowane, tworzą kształt litery L, reszta palców zwinięta w pięść.'],
  ['Ł', 'Układ jak przy literze L, dłoń wykonuje krótki ruch w dół i w bok.'],
  ['M', 'Dłoń skierowana w dół, wyprostowane i złączone trzy palce (wskazujący, środkowy, serdeczny), kciuk pod nimi.'],
  ['N', 'Dłoń skierowana w dół, wyprostowane i złączone dwa palce (wskazujący i środkowy).'],
  ['Ń', 'Układ jak przy literze N, dłoń wykonuje krótki ruch w dół.'],
  ['O', 'Palce i kciuk złączone opuszkami, tworzą okrąg (kształt litery O).'],
  ['Ó', 'Układ jak przy literze O, dłoń wykonuje krótki ruch w dół.'],
  ['P', 'Kciuk i palec wskazujący wyprostowane, dłoń ułożona poziomo, palec wskazujący wskazuje w lewo (dla praworęcznych).'],
  ['R', 'Palec wskazujący i środkowy wyprostowane i skrzyżowane, reszta palców zwinięta w pięść.'],
  ['S', 'Dłoń zwinięta w pięść, kciuk zapleciony na palcu wskazującym i środkowym.'],
  ['Ś', 'Układ jak przy literze S, dłoń wykonuje krótki ruch w dół.'],
  ['T', 'Palec wskazujący zgięty, kciuk wsunięty pod palec wskazujący, reszta palców zwinięta w pięść.'],
  ['U', 'Palec wskazujący i mały wyprostowane, środkowy i serdeczny zwinięte, przytrzymywane kciukiem.'],
  ['W', 'Palec wskazujący, środkowy i serdeczny wyprostowane i rozchylone, kciuk przytrzymuje mały palec.'],
  ['Y', 'Kciuk i mały palec wyprostowane i szeroko rozchylone, reszta palców zwinięta.'],
  ['Z', 'Palec wskazujący wyprostowany, rysuje w powietrzu kształt litery Z.'],
  ['Ź', 'Układ jak przy Z, po narysowaniu dłoń wykonuje krótki, akcentujący ruch w dół (kreska).'],
  ['Ż', 'Układ jak przy Z, po narysowaniu dłoń wykonuje ruch punktowy w dół (kropka).'],
];


/** Litery wykonywane z ruchem dłoni (znaki dynamiczne) → requiresMovement: true. */
const MOVING_LETTERS = new Set<string>(['Ą', 'Ć', 'Ę', 'J', 'Ł', 'Ń', 'Ó', 'Ś', 'Z', 'Ź', 'Ż']);
const MOVEMENT_IN_TEXT = /ruch|rysuje/i;

// =============================================================================
// Pomocnicze
// =============================================================================

/** „gdzie jest toaleta?” → „gdzie-jest-toaleta” (sep '-') / „gdzie_jest_toaleta” (sep '_'). */
function slugify(text: string, sep = '-'): string {
  return text
    .toLocaleLowerCase('pl')
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^\\${sep}+|\\${sep}+$`, 'g'), '');
}

/** Pierwsza litera wielka, reszta bez zmian: „jak się masz?” → „Jak się masz?”. */
const capitalize = (text: string): string => text.charAt(0).toLocaleUpperCase('pl') + text.slice(1);

function buildSignRows() {
  return CATEGORIES.flatMap((cat) =>
    cat.signs.map(([pl, en]) => ({
      categorySlug: cat.slug,
      kind: cat.kind,
      name: capitalize(pl),
      en,
      slug: slugify(pl),
      video_url: `${cat.slug}_${slugify(pl, '_')}.mp4`,
    })),
  );
}

function validate(rows: ReturnType<typeof buildSignRows>): void {
  const errors: string[] = [];
  if (rows.length !== EXPECTED_SIGNS) errors.push(`liczba znaków: ${rows.length}, oczekiwano ${EXPECTED_SIGNS}`);

  const dupes = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);
  const dupSlugs = dupes(rows.map((r) => r.slug));
  if (dupSlugs.length) errors.push(`zduplikowane slugi: ${[...new Set(dupSlugs)].join(', ')}`);
  const dupVideos = dupes(rows.map((r) => r.video_url));
  if (dupVideos.length) errors.push(`zduplikowane pliki wideo: ${[...new Set(dupVideos)].join(', ')}`);
  const dupCats = dupes(CATEGORIES.map((c) => c.slug));
  if (dupCats.length) errors.push(`zduplikowane kategorie: ${dupCats.join(', ')}`);

  const names = new Set(rows.map((r) => r.name));
  const missingFace = Object.keys(FACIAL_EXPRESSIONS).filter((n) => !names.has(n));
  if (missingFace.length) errors.push(`FACIAL_EXPRESSIONS: brak znaków ${missingFace.join(', ')}`);

  const letters = ALPHABET.map(([l]) => l);
  if (new Set(letters).size !== letters.length) errors.push('ALPHABET: zduplikowana litera');
  const unknownMoving = [...MOVING_LETTERS].filter((l) => !letters.includes(l));
  if (unknownMoving.length) errors.push(`MOVING_LETTERS: nieznane litery ${unknownMoving.join(', ')}`);
  const mismatch = ALPHABET.filter(([l, t]) => MOVEMENT_IN_TEXT.test(t) !== MOVING_LETTERS.has(l)).map(([l]) => l);
  if (mismatch.length) errors.push(`opis ruchu niezgodny z MOVING_LETTERS: ${mismatch.join(', ')}`);

  if (errors.length) throw new Error(`Błędy w danych seeda:\n  - ${errors.join('\n  - ')}`);
}

// =============================================================================
// Seed
// =============================================================================
async function seedDictionary(rows: ReturnType<typeof buildSignRows>): Promise<number> {
  console.log('Czyszczenie znaków i kategorii...');
  await prisma.sign.deleteMany();
  await prisma.category.deleteMany();

  console.log('Tworzenie kategorii...');
  const idBySlug = new Map<string, string>();
  for (const [index, cat] of CATEGORIES.entries()) {
    const created = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug, description: cat.description, sortOrder: index + 1 },
    });
    idBySlug.set(cat.slug, created.id);
  }

  console.log('Dodawanie znaków...');
  const result = await prisma.sign.createMany({
    data: rows.map((r) => ({
      name: r.name,
      slug: r.slug,
      kind: r.kind,
      description: null, // do uzupełnienia
      facialExpression: FACIAL_EXPRESSIONS[r.name] ?? null,
      video_url: r.video_url,
      category_id: idBySlug.get(r.categorySlug)!,
    })),
  });
  return result.count;
}

async function seedAlphabet(): Promise<number> {
  console.log('Aktualizacja alfabetu (upsert, bez czyszczenia)...');
  await prisma.$transaction(
    ALPHABET.map(([letter, handshape], index) => {
      const data = {
        video_url: `alfabet_${letter.toLocaleLowerCase('pl')}.mp4`,
        handshape,
        movement: null, // ruch opisany w treści handshape
        requiresMovement: MOVING_LETTERS.has(letter),
        sortOrder: index + 1,
      };
      return prisma.alphabet.upsert({ where: { letter }, update: data, create: { letter, ...data } });
    }),
  );
  return ALPHABET.length;
}

async function main(): Promise<void> {
  const rows = buildSignRows();
  validate(rows);

  if (process.argv.includes('--list-videos')) {
    for (const r of rows) console.log(r.video_url);
    for (const [l] of ALPHABET) console.log(`alfabet_${l.toLocaleLowerCase('pl')}.mp4`);
    return;
  }

  const signs = await seedDictionary(rows);
  const letters = await seedAlphabet();
  const phrases = rows.filter((r) => r.kind === 'PHRASE').length;
  const moving = ALPHABET.filter(([l]) => MOVING_LETTERS.has(l)).length;

  console.log(`✅ Kategorie: ${CATEGORIES.length} · znaki: ${signs} (w tym frazy: ${phrases}) · mimika: ${Object.keys(FACIAL_EXPRESSIONS).length}`);
  console.log(`✅ Alfabet: ${letters} liter (${moving} z ruchem, ${letters - moving} statycznych)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
