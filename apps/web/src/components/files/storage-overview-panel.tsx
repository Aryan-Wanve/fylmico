import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { formatFileSize } from "@/components/files/file-data";
import type { FilesSummary } from "@/types/base";

const RADIUS = 52;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CATEGORY_LABELS: Record<string, string> = {
  video: "Video",
  audio: "Audio",
  image: "Images",
  document: "Documents",
  other: "Other"
};

const CATEGORY_COLORS: Record<string, string> = {
  video: "#3b82f6",
  audio: "#8b5cf6",
  image: "#ec4899",
  document: "#f59e0b",
  other: "#94a3b8"
};

export function StorageOverviewPanel({
  summary
}: {
  summary: FilesSummary | null;
}) {
  const byCategory = summary?.byCategory ?? [];
  const usedBytes = summary?.usedBytes ?? 0;

  const arcs: { category: string; dash: number; offset: number }[] = [];
  let cumulative = 0;
  for (const entry of byCategory) {
    const dash = usedBytes > 0 ? (entry.bytes / usedBytes) * CIRCUMFERENCE : 0;
    arcs.push({ category: entry.category, dash, offset: cumulative });
    cumulative += dash;
  }

  return (
    <DashboardPanel title="Storage Overview">
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
            {arcs.map(({ category, dash, offset }) => (
              <circle
                cx="60"
                cy="60"
                fill="none"
                key={category}
                r={RADIUS}
                stroke={CATEGORY_COLORS[category] ?? "#94a3b8"}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-offset}
                strokeWidth={STROKE_WIDTH}
              />
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <strong className="block text-lg font-black text-[#11142c] dark:text-[#f1f2f8]">
                {formatFileSize(usedBytes) || "0 B"}
              </strong>
              <span className="text-[0.65rem] font-semibold text-[#8a90a3] dark:text-[#7d8299]">
                used
              </span>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-2.5">
          {byCategory.length > 0 ? (
            byCategory.map((entry) => (
              <div
                className="flex items-center justify-between gap-2 text-sm"
                key={entry.category}
              >
                <span className="flex items-center gap-2 font-semibold text-[#4b5268] dark:text-[#c7cad9]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: CATEGORY_COLORS[entry.category]
                    }}
                  />
                  {CATEGORY_LABELS[entry.category] ?? entry.category}
                </span>
                <span className="font-bold text-[#11142c] dark:text-[#f1f2f8]">
                  {formatFileSize(entry.bytes)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
              No files uploaded yet.
            </p>
          )}
        </div>
      </div>
    </DashboardPanel>
  );
}
