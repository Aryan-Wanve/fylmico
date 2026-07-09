import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { storageBreakdown, storageTotalGb } from "@/components/files/file-data";

const RADIUS = 52;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StorageOverviewPanel() {
  const usedGb = storageBreakdown.reduce((sum, entry) => sum + entry.sizeGb, 0);

  const arcs: {
    entry: (typeof storageBreakdown)[number];
    dash: number;
    offset: number;
  }[] = [];
  let cumulative = 0;
  for (const entry of storageBreakdown) {
    const dash = (entry.sizeGb / usedGb) * CIRCUMFERENCE;
    arcs.push({ entry, dash, offset: cumulative });
    cumulative += dash;
  }

  return (
    <DashboardPanel action={{ label: "View all" }} title="Storage Overview">
      <div className="flex items-center gap-6 p-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              fill="none"
              r={RADIUS}
              stroke="#f1f1f6"
              strokeWidth={STROKE_WIDTH}
            />
            {arcs.map(({ entry, dash, offset }) => (
              <circle
                cx="60"
                cy="60"
                fill="none"
                key={entry.label}
                r={RADIUS}
                stroke={entry.color}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-offset}
                strokeWidth={STROKE_WIDTH}
              />
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <strong className="block text-xl font-black text-[#11142c]">
                {usedGb} GB
              </strong>
              <span className="text-[0.65rem] font-semibold text-[#8a90a3]">
                of {storageTotalGb / 1000} TB
              </span>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-2.5">
          {storageBreakdown.map((entry) => (
            <div
              className="flex items-center justify-between gap-2 text-sm"
              key={entry.label}
            >
              <span className="flex items-center gap-2 font-semibold text-[#4b5268]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.label}
              </span>
              <span className="font-bold text-[#11142c]">
                {entry.sizeGb} GB
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
