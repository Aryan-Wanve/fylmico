import type { ActivityHeatmap as ActivityHeatmapData } from "@/types/base";

const INTENSITY_CLASSES = [
  "bg-black/[0.04] dark:bg-white/[0.06]",
  "bg-[var(--fylmico-accent)]/20",
  "bg-[var(--fylmico-accent)]/40",
  "bg-[var(--fylmico-accent)]/65",
  "bg-[var(--fylmico-accent)]/90"
];

export function ActivityHeatmap({ heatmap }: { heatmap: ActivityHeatmapData }) {
  const { dayLabels, timeLabels, matrix } = heatmap;

  return (
    <div>
      <div className="grid grid-cols-[2.5rem_repeat(6,1fr)] gap-1.5 px-6 pt-2">
        <div />
        {timeLabels.map((label) => (
          <div
            className="text-center text-[0.65rem] font-semibold text-[#667085] dark:text-[#878ca0]"
            key={label}
          >
            {label}
          </div>
        ))}
        {dayLabels.map((day, rowIndex) => (
          <div className="contents" key={day}>
            <div className="flex items-center text-xs font-semibold text-[#667085] dark:text-[#878ca0]">
              {day}
            </div>
            {matrix[rowIndex].map((intensity, colIndex) => (
              <div
                className={`h-7 rounded-md ${INTENSITY_CLASSES[intensity]}`}
                key={colIndex}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-3 text-xs font-medium text-[#667085] dark:text-[#878ca0]">
        <span>Less activity</span>
        <div className="flex gap-1">
          {INTENSITY_CLASSES.map((cls) => (
            <span className={`h-3 w-3 rounded-sm ${cls}`} key={cls} />
          ))}
        </div>
        <span>More activity</span>
      </div>
    </div>
  );
}
