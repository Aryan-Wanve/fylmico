"use client";

import { useEffect, useState } from "react";

const TICK_MS = 30_000;

// Forces a re-render every 30s so components computing relative time
// ("2 min ago") stay fresh without each mounting its own interval.
export function useTicker(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((current) => current + 1);
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, []);

  return tick;
}
