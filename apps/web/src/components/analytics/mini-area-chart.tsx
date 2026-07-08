const WIDTH = 320;
const HEIGHT = 120;
const PADDING_BOTTOM = 18;
const PADDING_TOP = 10;

export function MiniAreaChart({
  points,
  xLabels,
  color = "#654cff",
  peakLabel
}: {
  points: number[];
  xLabels: string[];
  color?: string;
  peakLabel: string;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const peakIndex = points.indexOf(max);
  const plotHeight = HEIGHT - PADDING_BOTTOM - PADDING_TOP;

  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * WIDTH;
    const y = PADDING_TOP + (1 - (point - min) / range) * plotHeight;
    return [x, y] as const;
  });

  const linePath = coords
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1][0]},${HEIGHT - PADDING_BOTTOM} L${coords[0][0]},${HEIGHT - PADDING_BOTTOM} Z`;
  const [peakX, peakY] = coords[peakIndex];

  return (
    <div className="relative">
      <svg
        className="h-28 w-full"
        preserveAspectRatio="none"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        <path d={areaPath} fill={color} fillOpacity={0.1} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
        {coords.map(([x, y], index) => (
          <circle
            cx={x}
            cy={y}
            fill={index === peakIndex ? color : "white"}
            key={index}
            r={index === peakIndex ? 4 : 3}
            stroke={color}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {xLabels.map((label, index) => (
          <text
            className="fill-[#8a90a3] text-[9px] font-semibold"
            key={label}
            textAnchor="middle"
            x={(index / (xLabels.length - 1)) * WIDTH}
            y={HEIGHT - 4}
          >
            {label}
          </text>
        ))}
      </svg>
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-[130%] rounded-lg bg-[#11142c] px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white"
        style={{
          left: `${(peakX / WIDTH) * 100}%`,
          top: `${(peakY / HEIGHT) * 100}%`
        }}
      >
        {peakLabel}
      </div>
    </div>
  );
}
