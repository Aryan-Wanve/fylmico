import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart } from "@/components/analytics/donut-chart";
import type { TaskStatusBreakdownEntry } from "@/types/base";

export function TaskStatusPanel({
  breakdown
}: {
  breakdown: TaskStatusBreakdownEntry[];
}) {
  const total = breakdown.reduce((sum, entry) => sum + entry.count, 0);
  const segments = breakdown.map((entry) => ({
    label: entry.label,
    value: entry.count,
    color: entry.color
  }));

  return (
    <DashboardPanel title="Task Status">
      <div className="grid gap-4 p-6">
        {total === 0 ? (
          <p className="py-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
            No tasks yet.
          </p>
        ) : (
          <div className="flex items-center gap-6">
            <DonutChart
              centerLabel={String(total)}
              centerSublabel="Total Tasks"
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
                  <span className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                    {segment.value}
                  </span>
                  <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
                    ({Math.round((segment.value / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}
