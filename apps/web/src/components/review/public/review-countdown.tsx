"use client";

import { useEffect, useState } from "react";

function formatRemaining(totalSeconds: number): string {
  if (totalSeconds <= 0) return "Expired";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `Expires in ${days}d ${hours}h`;
  if (hours > 0) return `Expires in ${hours}h ${minutes}m`;
  if (minutes > 0) return `Expires in ${minutes}m`;
  return "Expires in under a minute";
}

export function ReviewCountdown({
  initialRemainingSeconds
}: {
  initialRemainingSeconds: number;
}) {
  const [remaining, setRemaining] = useState(initialRemainingSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`text-xs font-semibold ${remaining <= 0 ? "text-red-400" : "text-white/50"}`}
    >
      {formatRemaining(remaining)}
    </span>
  );
}
