const TONE_COLOR: Record<"violet" | "blue" | "green" | "orange", string> = {
  violet: "#654cff",
  blue: "#3b82f6",
  green: "#16c784",
  orange: "#f97316"
};

export function Sparkline({
  points,
  tone
}: {
  points: number[];
  tone: "violet" | "blue" | "green" | "orange";
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coordinates = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 32 - ((point - min) / range) * 28 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="h-8 w-[4.6rem] shrink-0" viewBox="0 0 100 32">
      <polyline
        fill="none"
        points={coordinates}
        stroke={TONE_COLOR[tone]}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
      />
    </svg>
  );
}
