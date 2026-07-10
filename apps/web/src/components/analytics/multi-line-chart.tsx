export type ChartSeries = {
  id: string;
  label: string;
  color: string;
  points: number[];
};

const WIDTH = 700;
const HEIGHT = 260;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 56;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

function xAt(index: number, count: number): number {
  return PADDING_LEFT + (index / (count - 1)) * PLOT_WIDTH;
}

export function MultiLineChart({
  series,
  xLabels,
  valueSuffix = "%",
  maxValue
}: {
  series: ChartSeries[];
  xLabels: string[];
  valueSuffix?: string;
  maxValue?: number;
}) {
  const scaleMax =
    maxValue ?? Math.max(1, ...series.flatMap((line) => line.points), 100);
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.round(fraction * scaleMax)
  );

  function yAt(value: number): number {
    return PADDING_TOP + (1 - value / scaleMax) * PLOT_HEIGHT;
  }

  return (
    <svg className="h-64 w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      {gridValues.map((value) => (
        <g key={value}>
          <line
            stroke="rgba(0,0,0,0.05)"
            x1={PADDING_LEFT}
            x2={WIDTH - PADDING_RIGHT}
            y1={yAt(value)}
            y2={yAt(value)}
          />
          <text
            className="fill-[#8a90a3] text-[10px] font-semibold"
            textAnchor="end"
            x={PADDING_LEFT - 8}
            y={yAt(value) + 3}
          >
            {value}
            {valueSuffix}
          </text>
        </g>
      ))}

      {xLabels.map((label, index) => (
        <text
          className="fill-[#8a90a3] text-[10px] font-semibold"
          key={label}
          textAnchor="middle"
          x={xAt(index, xLabels.length)}
          y={HEIGHT - 4}
        >
          {label}
        </text>
      ))}

      {series.map((line) => {
        const points = line.points.map(
          (value, index) =>
            [xAt(index, line.points.length), yAt(value)] as const
        );
        const linePath = points
          .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`)
          .join(" ");
        const [lastX, lastY] = points[points.length - 1];
        const [firstX] = points[0];
        const areaPath = `${linePath} L${lastX},${yAt(0)} L${firstX},${yAt(0)} Z`;

        return (
          <g key={line.id}>
            <path
              d={areaPath}
              fill={line.color}
              fillOpacity={0.08}
              stroke="none"
            />
            <path
              d={linePath}
              fill="none"
              stroke={line.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
            />
            {points.map(([x, y], index) => (
              <circle cx={x} cy={y} fill={line.color} key={index} r={3} />
            ))}
            <rect
              fill={line.color}
              height={16}
              rx={8}
              width={34}
              x={lastX + 8}
              y={lastY - 8}
            />
            <text
              className="fill-white text-[10px] font-bold"
              textAnchor="middle"
              x={lastX + 25}
              y={lastY + 3}
            >
              {line.points[line.points.length - 1]}
              {valueSuffix}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
