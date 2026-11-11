import { IconFace, IconHand, IconMove } from './Icons.jsx';

/**
 * Szczegóły wykonania znaku w oknie modalnym.
 * – Litera alfabetu (Feature 2): ułożenie dłoni, ruch, typ znaku (statyczny / dynamiczny).
 * – Znak słownika (Feature 3): mimika — tylko gdy opis istnieje.
 * Lista definicji (<dl>) — czytnik ekranu odczytuje pary „etykieta: treść”.
 */
export default function SignDetails({ sign }) {
  const isLetter = sign.category === 'alfabet';

  if (isLetter) {
    return (
      <div className="details">
        <p className={`details__badge${sign.dynamic ? ' details__badge--accent' : ''}`}>
          <span className="details__badge-dot" aria-hidden="true" />
          {sign.dynamic ? 'Znak dynamiczny — z ruchem dłoni' : 'Znak statyczny — bez ruchu'}
        </p>

        <dl className="details__list">
          <div className="details__item">
            <dt className="details__label">
              <IconHand aria-hidden="true" /> Ułożenie dłoni
            </dt>
            <dd className={sign.handshape ? 'details__text' : 'details__text details__text--pending'}>
              {sign.handshape ?? 'Opis w przygotowaniu — skorzystaj z nagrania.'}
            </dd>
          </div>

          {sign.movement && (
            <div className="details__item">
              <dt className="details__label">
                <IconMove aria-hidden="true" /> Ruch
              </dt>
              <dd className="details__text">{sign.movement}</dd>
            </div>
          )}
        </dl>
      </div>
    );
  }

  if (!sign.facialExpression) return null;

  return (
    <div className="details">
      <dl className="details__list">
        <div className="details__item details__item--highlight">
          <dt className="details__label">
            <IconFace aria-hidden="true" /> Mimika
          </dt>
          <dd className="details__text">{sign.facialExpression}</dd>
          <dd className="details__hint">
            W PJM wyraz twarzy jest częścią znaku — bez właściwej mimiki znak może zostać źle zrozumiany.
          </dd>
        </div>
      </dl>
    </div>
  );
}
