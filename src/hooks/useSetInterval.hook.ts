import { useEffect, useRef } from "react";

type IntervalCallback = () => void;

export function useSetInterval(callback: IntervalCallback, delayMs: number | null) {
  const savedCallbackRef = useRef<IntervalCallback | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delayMs === null) return;

    const tick = () => {
      if (savedCallbackRef.current) {
        savedCallbackRef.current();
      }
    };

    const id = window.setInterval(tick, delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}

export default useSetInterval;


