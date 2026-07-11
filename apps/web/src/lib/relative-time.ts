const UNITS: Array<{ limit: number; divisor: number; label: string }> = [
  { limit: 60, divisor: 1, label: "second" },
  { limit: 3600, divisor: 60, label: "minute" },
  { limit: 86400, divisor: 3600, label: "hour" },
  { limit: 2592000, divisor: 86400, label: "day" },
  { limit: 31536000, divisor: 2592000, label: "month" },
  { limit: Infinity, divisor: 31536000, label: "year" }
];

export function formatRelativeTime(isoDate: string): string {
  const seconds = Math.max(
    0,
    Math.round((Date.now() - new Date(isoDate).getTime()) / 1000)
  );

  if (seconds < 5) {
    return "just now";
  }

  const unit = UNITS.find((candidate) => seconds < candidate.limit)!;
  const value = Math.max(1, Math.round(seconds / unit.divisor));
  return `${value} ${unit.label}${value === 1 ? "" : "s"} ago`;
}
