import LegalPage from '../components/LegalPage.jsx';
import { site } from '../config/site.js';

/**
 * Polityka prywatności — szablon dla serwisu bez kont, formularzy, cookies i analityki.
 * ⚠ Dane w nawiasach [ ] uzupełnij w src/config/site.js. Przed publikacją
 *   warto skonsultować treść z promotorem lub prawnikiem.
 */
export default function PrivacyPolicy() {
  const sections = [
    {
      id: 'administrator',
      title: 'Administrator',
      body: (
        <>
          <p>
            Administratorem serwisu <strong>{site.name}</strong> dostępnego pod adresem{' '}
            <a href={site.url}>{site.url}</a> jest <strong>{site.owner}</strong>. Serwis jest {site.project} i ma
            charakter wyłącznie edukacyjny i niekomercyjny.
          </p>
          <p>
            Kontakt we wszystkich sprawach dotyczących prywatności:{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </>
      ),
    },
    {
      id: 'brak-danych',
      title: 'Jakich danych nie zbieramy',
      body: (
        <>
          <p>Serwis został zaprojektowany tak, aby działał bez zbierania danych osobowych użytkowników:</p>
          <ul>
            <li>nie wymaga rejestracji ani logowania — nie prowadzimy kont użytkowników,</li>
            <li>nie zawiera formularzy — nie przesyłasz nam żadnych informacji,</li>
            <li>nie używa plików cookies,</li>
            <li>nie używa narzędzi analitycznych, statystycznych ani reklamowych (np. Google Analytics, piksele),</li>
            <li>czcionki i ikony są dostarczane z naszego serwera — przeglądarka nie łączy się z zewnętrznymi dostawcami czcionek.</li>
          </ul>
          <p>Administrator nie ma dostępu do informacji pozwalających zidentyfikować osoby korzystające z serwisu.</p>
        </>
      ),
    },
    {
      id: 'hosting',
      title: 'Dane techniczne u dostawców hostingu',
      body: (
        <>
          <p>
            Aby strona mogła zostać wyświetlona, Twoja przeglądarka łączy się z serwerami dostawców infrastruktury.
            Dostawcy ci — jak każdy serwer w internecie — mogą automatycznie zapisywać w dziennikach systemowych
            podstawowe dane techniczne: adres IP, datę i godzinę zapytania, adres pobieranego zasobu oraz informacje
            o przeglądarce.
          </p>
          <div className="legal__table-wrap">
            <table className="legal__table">
              <caption className="visually-hidden">Dostawcy infrastruktury</caption>
              <thead>
                <tr><th scope="col">Dostawca</th><th scope="col">Rola</th><th scope="col">Siedziba</th></tr>
              </thead>
              <tbody>
                {site.providers.map((p) => (
                  <tr key={p.name}><td>{p.name}</td><td>{p.role}</td><td>{p.country}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Dane te są przetwarzane przez dostawców w celu dostarczenia strony oraz zapewnienia bezpieczeństwa
            (np. ochrony przed atakami), na podstawie prawnie uzasadnionego interesu — art. 6 ust. 1 lit. f RODO.
            Baza danych przechowuje wyłącznie treść słownika (nazwy znaków, opisy, nazwy plików wideo) i nie zawiera
            żadnych informacji o użytkownikach.
          </p>
        </>
      ),
    },
    {
      id: 'eog',
      title: 'Przekazywanie danych poza EOG',
      body: (
        <p>
          Część dostawców ma siedzibę w Stanach Zjednoczonych. Przekazywanie danych technicznych odbywa się na
          podstawie mechanizmów przewidzianych w RODO, takich jak decyzja Komisji Europejskiej w sprawie ram
          ochrony danych UE–USA (EU-US Data Privacy Framework) lub standardowe klauzule umowne stosowane przez
          tych dostawców. Szczegóły znajdziesz w politykach prywatności poszczególnych dostawców.
        </p>
      ),
    },
    {
      id: 'pamiec-lokalna',
      title: 'Pamięć lokalna przeglądarki',
      body: (
        <>
          <p>
            Niektóre funkcje (np. postęp nauki w fiszkach, ulubione znaki, wybrane ustawienia) mogą zapisywać dane
            w pamięci lokalnej Twojej przeglądarki (<span lang="en">localStorage</span>). Te informacje:
          </p>
          <ul>
            <li>pozostają wyłącznie na Twoim urządzeniu i nigdy nie są wysyłane do administratora ani dostawców,</li>
            <li>są niezbędne do działania funkcji, z której świadomie korzystasz,</li>
            <li>możesz je w każdej chwili usunąć, czyszcząc dane witryny w ustawieniach przeglądarki.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'nagrania',
      title: 'Wizerunek osób w nagraniach',
      body: (
        <p>
          Nagrania przedstawiają osoby demonstrujące znaki PJM. Wizerunek tych osób jest rozpowszechniany
          wyłącznie na podstawie ich pisemnej zgody (art. 6 ust. 1 lit. a RODO oraz art. 81 ustawy o prawie
          autorskim i prawach pokrewnych). Każda z tych osób może wycofać zgodę, kontaktując się z administratorem —
          nagranie zostanie wtedy usunięte z serwisu.
        </p>
      ),
    },
    {
      id: 'prawa',
      title: 'Twoje prawa',
      body: (
        <>
          <p>
            W zakresie, w jakim przetwarzane są Twoje dane osobowe, przysługuje Ci prawo do dostępu do danych, ich
            sprostowania, usunięcia, ograniczenia przetwarzania oraz wniesienia sprzeciwu. Ponieważ administrator
            nie zbiera danych użytkowników, w sprawie dzienników technicznych najskuteczniej jest zwrócić się
            bezpośrednio do właściwego dostawcy hostingu.
          </p>
          <p>
            Masz również prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2,
            00-193 Warszawa, <a href="https://uodo.gov.pl">uodo.gov.pl</a>).
          </p>
        </>
      ),
    },
    {
      id: 'zmiany',
      title: 'Zmiany polityki',
      body: (
        <p>
          Polityka może być aktualizowana, np. przy dodaniu nowych funkcji. Aktualna wersja jest zawsze dostępna
          na tej stronie, a data ostatniej zmiany widnieje na górze dokumentu.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Informacje prawne"
      title="Polityka prywatności"
      intro={
        <p>
          W skrócie: <strong>nie zbieramy Twoich danych.</strong> Nie ma kont, formularzy, cookies ani analityki.
          Poniżej wyjaśniamy szczegóły, w tym rolę dostawców hostingu.
        </p>
      }
      sections={sections}
    />
  );
}
