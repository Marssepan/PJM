import LegalPage from '../components/LegalPage.jsx';
import { site } from '../config/site.js';

/**
 * Regulamin świadczenia usług drogą elektroniczną
 * (ustawa z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną).
 * ⚠ Dane w nawiasach [ ] uzupełnij w src/config/site.js. Przed publikacją
 *   warto skonsultować treść z promotorem lub prawnikiem.
 */
export default function Terms() {
  const sections = [
    {
      id: 'postanowienia-ogolne',
      title: 'Postanowienia ogólne',
      body: (
        <ol>
          <li>
            Regulamin określa zasady korzystania z serwisu <strong>{site.name}</strong> dostępnego pod adresem{' '}
            <a href={site.url}>{site.url}</a> (dalej: „Serwis”).
          </li>
          <li>
            Usługodawcą jest <strong>{site.owner}</strong>, kontakt: <a href={`mailto:${site.email}`}>{site.email}</a>{' '}
            (dalej: „Usługodawca”).
          </li>
          <li>Serwis jest {site.project}. Ma charakter edukacyjny i niekomercyjny.</li>
          <li>Regulamin jest udostępniany nieodpłatnie i można go w każdej chwili wyświetlić, zapisać lub wydrukować.</li>
        </ol>
      ),
    },
    {
      id: 'definicje',
      title: 'Definicje',
      body: (
        <ul>
          <li><strong>Użytkownik</strong> — każda osoba korzystająca z Serwisu.</li>
          <li><strong>Treści</strong> — nagrania wideo, opisy znaków, teksty i elementy graficzne udostępnione w Serwisie.</li>
          <li><strong>PJM</strong> — Polski Język Migowy.</li>
        </ul>
      ),
    },
    {
      id: 'uslugi',
      title: 'Zakres usług',
      body: (
        <>
          <p>Usługodawca udostępnia nieodpłatnie:</p>
          <ul>
            <li>słownik znaków PJM z nagraniami wideo i opisami,</li>
            <li>przeglądanie znaków według kategorii tematycznych oraz wyszukiwarkę,</li>
            <li>alfabet palcowy PJM,</li>
            <li>narzędzia do nauki (np. fiszki, quizy) — w miarę ich udostępniania.</li>
          </ul>
          <p>
            Korzystanie z Serwisu nie wymaga rejestracji. Umowa o świadczenie usług zostaje zawarta z chwilą
            otwarcia Serwisu i rozwiązana z chwilą jego opuszczenia.
          </p>
        </>
      ),
    },
    {
      id: 'wymagania',
      title: 'Wymagania techniczne',
      body: (
        <ul>
          <li>urządzenie z dostępem do internetu,</li>
          <li>aktualna przeglądarka internetowa z włączoną obsługą JavaScript (np. Chrome, Firefox, Safari, Edge),</li>
          <li>obsługa odtwarzania wideo w formacie MP4 (H.264).</li>
        </ul>
      ),
    },
    {
      id: 'zasady',
      title: 'Zasady korzystania',
      body: (
        <>
          <p>Użytkownik zobowiązuje się korzystać z Serwisu zgodnie z prawem i dobrymi obyczajami. Zabronione jest w szczególności:</p>
          <ul>
            <li>podejmowanie działań zakłócających działanie Serwisu (np. ataki, przeciążanie serwera),</li>
            <li>automatyczne, masowe pobieranie Treści (np. za pomocą skryptów),</li>
            <li>wykorzystywanie wizerunku osób z nagrań w sposób naruszający ich dobra osobiste.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'prawa-autorskie',
      title: 'Treści i prawa autorskie',
      body: (
        <ol>
          <li>Treści są chronione prawem autorskim. Prawa do nich przysługują Usługodawcy lub osobom, które udzieliły zgody na ich wykorzystanie.</li>
          <li>Użytkownik może korzystać z Treści w zakresie dozwolonego użytku osobistego, w szczególności do własnej nauki PJM.</li>
          <li>Kopiowanie, rozpowszechnianie lub wykorzystywanie Treści w innym celu wymaga zgody Usługodawcy.</li>
          <li>Osoby widoczne w nagraniach wyraziły zgodę na rozpowszechnianie swojego wizerunku w Serwisie.</li>
        </ol>
      ),
    },
    {
      id: 'odpowiedzialnosc',
      title: 'Odpowiedzialność',
      body: (
        <ol>
          <li>
            Serwis jest narzędziem pomocniczym i nie zastępuje kursu prowadzonego przez certyfikowanego lektora PJM.
            PJM ma odmiany regionalne — prezentowany znak może różnić się od używanego w Twoim otoczeniu.
          </li>
          <li>Usługodawca dokłada starań, aby Treści były poprawne, lecz nie gwarantuje ich kompletności ani braku błędów.</li>
          <li>
            Usługodawca nie gwarantuje nieprzerwanej dostępności Serwisu. Serwis korzysta z bezpłatnych usług
            hostingowych i może być czasowo niedostępny, np. z powodu prac technicznych lub limitów dostawców.
          </li>
        </ol>
      ),
    },
    {
      id: 'reklamacje',
      title: 'Zgłoszenia i reklamacje',
      body: (
        <ol>
          <li>
            Błędy w Treściach (np. nieprawidłowy znak) oraz problemy techniczne można zgłaszać na adres{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </li>
          <li>Zgłoszenie powinno zawierać opis problemu oraz — w miarę możliwości — nazwę znaku lub adres strony.</li>
          <li>Usługodawca rozpatruje zgłoszenia w terminie 14 dni od ich otrzymania.</li>
        </ol>
      ),
    },
    {
      id: 'postanowienia-koncowe',
      title: 'Postanowienia końcowe',
      body: (
        <ol>
          <li>Zasady ochrony prywatności opisuje <a href="#/polityka-prywatnosci">Polityka prywatności</a>.</li>
          <li>Usługodawca może zmienić Regulamin z ważnych przyczyn (np. zmiana przepisów, nowe funkcje). Zmiany obowiązują od dnia publikacji w Serwisie.</li>
          <li>W sprawach nieuregulowanych stosuje się przepisy prawa polskiego. Postanowienia Regulaminu nie ograniczają praw konsumentów wynikających z bezwzględnie obowiązujących przepisów.</li>
        </ol>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Informacje prawne"
      title="Regulamin"
      intro={
        <p>
          Serwis jest <strong>bezpłatny, bez rejestracji i bez reklam.</strong> Regulamin opisuje zasady korzystania
          z niego zgodnie z ustawą o świadczeniu usług drogą elektroniczną.
        </p>
      }
      sections={sections}
    />
  );
}
