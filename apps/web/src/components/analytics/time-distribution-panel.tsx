import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart } from "@/components/analytics/donut-chart";
import { formatHours } from "@/components/analytics/analytics-data";
import type { TimeDistributionEntry } from "@/types/base";

export function TimeDistributionPanel({
  timeDistribution
}: {
  timeDistribution: TimeDistributionEntry[];
}) {
  const total = timeDistribution.reduce((sum, entry) => sum + entry.hours, 0);
  const segments = timeDistribution.map((entry) => ({
    label: entry.phase,
    value: entry.hours,
    color: entry.color
  }));

  return (
    <DashboardPanel title="Time Distribution">
      {total === 0 ? (
        <p className="py-10 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
          Log time to see how hours break down by phase.
        </p>
      ) : (
        <div className="flex items-center gap-6 p-6">
          <DonutChart
            centerLabel={formatHours(total)}
            centerSublabel="Total Hours"
            segments={segments}
            total={total}
          />
          <div className="grid min-w-0 flex-1 gap-2.5">
            {segments.map((segment) => (
              <div className="flex items-center gap-2" key={segment.label}>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#3a3f57] dark:text-[#b4b8cc]">
                  {segment.label}
                </span>
                <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
                  {Math.round((segment.value / total) * 100)}% (
                  {formatHours(segment.value)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}
