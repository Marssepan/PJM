import { useCallback, useEffect, useState } from 'react';
import { STORAGE_EVENT_KEY, clearProgress, readProgress, writeProgress } from './progress.js';

/** Stan postępu z localStorage + synchronizacja między kartami przeglądarki. */
export default function useProgress() {
  const [progress, setProgress] = useState(readProgress);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_EVENT_KEY || e.key === null) setProgress(readProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** @param {(p: object) => object} fn */
  const update = useCallback((fn) => {
    setProgress((prev) => {
      const next = fn(prev);
      writeProgress(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    clearProgress();
    setProgress({});
  }, []);

  return { progress, update, reset };
}
