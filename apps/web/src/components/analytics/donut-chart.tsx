import type { ChartSegment } from "@/components/analytics/analytics-data";

const RADIUS = 60;
const STROKE_WIDTH = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({
  segments,
  total,
  centerLabel,
  centerSublabel
}: {
  segments: ChartSegment[];
  total: number;
  centerLabel: string;
  centerSublabel: string;
}) {
  const arcs: { segment: ChartSegment; length: number; dashOffset: number }[] =
    [];
  let cumulative = 0;

  for (const segment of segments) {
    const length = (segment.value / total) * CIRCUMFERENCE;

    arcs.push({ segment, length, dashOffset: -cumulative });
    cumulative += length;
  }

  return (
    <div className="relative grid h-40 w-40 shrink-0 place-items-center">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160">
        <circle
          cx={80}
          cy={80}
          fill="none"
          r={RADIUS}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={STROKE_WIDTH}
        />
        {arcs.map(({ segment, length, dashOffset }) => (
          <circle
            cx={80}
            cy={80}
            fill="none"
            key={segment.label}
            r={RADIUS}
            stroke={segment.color}
            strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth={STROKE_WIDTH}
          />
        ))}
      </svg>
      <div className="absolute grid place-items-center text-center leading-tight">
        <strong className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          {centerLabel}
        </strong>
        <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
          {centerSublabel}
        </span>
      </div>
    </div>
  );
}
