"use client";

import { useEffect, useReducer } from "react";
import { formatRelative } from "@/lib/format";

/**
 * Renders a relative timestamp ("vor 5 Min") that auto-refreshes every 30s.
 * suppressHydrationWarning toleriert die unvermeidliche Mini-Differenz zwischen
 * Server-Render und Client-Hydration (Sekunden-Drift).
 */
export function RelativeTime({ iso }: { iso: string }) {
  const [, tick] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {formatRelative(iso)}
    </time>
  );
}
