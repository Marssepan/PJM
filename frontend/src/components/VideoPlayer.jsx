import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconExpand, IconLoop, IconPause, IconPlay, IconRestart,
} from './Icons.jsx';

const RATES = [0.5, 0.75, 1];

function fmt(t) {
  if (!Number.isFinite(t)) return '0:00';
  const s = Math.floor(t);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function spokenTime(t) {
  const s = Math.floor(t || 0);
  return `${s} s`;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Własny odtwarzacz HTML5 dla lokalnych plików .mp4.
 * – Spowolnione tempo (0.5×/0.75×) i pętla — kluczowe przy nauce znaków.
 * – Skróty (tylko gdy fokus jest w odtwarzaczu — WCAG 2.1.4): Spacja/K odtwórz, ←/→ ±1 s, L pętla.
 * – Nagrania znaków są nieme (zawsze wyciszone) — treść niesie obraz i opis tekstowy.
 * – Autostart w pętli i w pętli, chyba że użytkownik prosi o ograniczenie ruchu.
 */
export default function VideoPlayer({ src, fileName, title, describedBy }) {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const uid = useId();
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(true);
  const [error, setError] = useState(!src);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setError(!src); // brak video_url w bazie → od razu stan „niedostępne”
    setReady(false);
    setTime(0);
    setPlaying(false);
  }, [src]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = rate;
  }, [rate, src]);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v || error) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, [error]);

  const seek = (t) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.min(Math.max(t, 0), duration);
    setTime(v.currentTime);
  };

  const restart = () => {
    seek(0);
    videoRef.current?.play().catch(() => {});
  };

  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else if (el.requestFullscreen) el.requestFullscreen();
    else videoRef.current?.webkitEnterFullscreen?.(); // iOS Safari
  };

  const onKeyDown = (e) => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'BUTTON') return;
    if (e.key === ' ' || e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seek(time + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seek(time - 1);
    } else if (e.key.toLowerCase() === 'l') {
      setLoop((l) => !l);
    }
  };

  const progress = duration ? (time / duration) * 100 : 0;

  return (
    <figure
      ref={wrapRef}
      className={`player${playing ? ' is-playing' : ''}`}
      aria-label={`Nagranie wideo: znak „${title}”`}
      onKeyDown={onKeyDown}
    >
      <div className="player__stage">
        {!error && (
          <video
            ref={videoRef}
            className="player__video"
            src={src}
            playsInline
            muted
            loop={loop}
            preload="metadata"
            autoPlay={!prefersReducedMotion()}
            tabIndex={-1}
            aria-describedby={describedBy}
            onClick={toggle}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration);
              e.currentTarget.playbackRate = rate;
              setReady(true);
            }}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onError={() => setError(true)}
          />
        )}

        {error && (
          <div className="player__fallback" role="note">
            <span className="player__fallback-title">Nagranie niedostępne</span>
            <span className="player__fallback-path">
              {fileName ? (
                <>Serwer nie zwrócił pliku <code>{fileName}</code></>
              ) : (
                'Ten znak nie ma jeszcze przypisanego nagrania.'
              )}
            </span>
          </div>
        )}

        {!error && !ready && (
          <div className="player__loading" role="status">
            <span className="player__spinner" aria-hidden="true" />
            <span className="visually-hidden">Ładowanie nagrania…</span>
          </div>
        )}

        <AnimatePresence>
          {!playing && !error && ready && (
            <motion.button
              type="button"
              className="player__big-play"
              onClick={toggle}
              aria-label={`Odtwórz znak „${title}”`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
            >
              <IconPlay aria-hidden="true" width={28} height={28} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="player__controls" role="group" aria-label="Sterowanie odtwarzaniem">
        <div className="player__timeline">
          <label htmlFor={`${uid}-seek`} className="visually-hidden">Pozycja odtwarzania</label>
          <input
            id={`${uid}-seek`}
            className="player__range"
            type="range"
            min={0}
            max={duration || 0}
            step={0.05}
            value={time}
            disabled={!ready || error}
            onChange={(e) => seek(Number(e.target.value))}
            aria-valuetext={`${spokenTime(time)} z ${spokenTime(duration)}`}
            style={{ '--progress': `${progress}%` }}
          />
          <span className="player__time" aria-hidden="true">
            {fmt(time)} <span className="player__time-sep">/</span> {fmt(duration)}
          </span>
        </div>

        <div className="player__row">
          <div className="player__group">
            <button type="button" className="ctrl" onClick={toggle} disabled={error} aria-label={playing ? 'Pauza' : 'Odtwórz'}>
              {playing ? <IconPause aria-hidden="true" /> : <IconPlay aria-hidden="true" />}
            </button>
            <button type="button" className="ctrl" onClick={restart} disabled={error || !ready} aria-label="Od początku">
              <IconRestart aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ctrl"
              onClick={() => setLoop((l) => !l)}
              aria-pressed={loop}
              aria-label="Zapętlenie"
            >
              <IconLoop aria-hidden="true" />
            </button>
          </div>

          <div className="player__rates" role="group" aria-label="Tempo odtwarzania">
            {RATES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={rate === r}
                aria-label={`Tempo ${r}×`}
                className="rate"
                onClick={() => setRate(r)}
              >
                {r}×
              </button>
            ))}
          </div>

          <div className="player__group">
            <button type="button" className="ctrl" onClick={fullscreen} disabled={error} aria-label="Pełny ekran">
              <IconExpand aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </figure>
  );
}
