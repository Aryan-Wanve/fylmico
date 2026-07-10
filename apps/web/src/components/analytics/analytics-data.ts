export type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1)}h`;
}
