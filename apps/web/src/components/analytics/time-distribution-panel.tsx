import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart } from "@/components/analytics/donut-chart";
import {
  timeDistributionSegments,
  timeDistributionTotal
} from "@/components/analytics/analytics-data";

export function TimeDistributionPanel() {
  return (
    <DashboardPanel title="Time Distribution">
      <div className="flex items-center gap-6 p-6">
        <DonutChart
          centerLabel={`${timeDistributionTotal.toLocaleString()}h`}
          centerSublabel="Total Hours"
          segments={timeDistributionSegments}
          total={timeDistributionTotal}
        />
        <div className="grid min-w-0 flex-1 gap-2.5">
          {timeDistributionSegments.map((segment) => (
            <div className="flex items-center gap-2" key={segment.label}>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#3a3f57]">
                {segment.label}
              </span>
              <span className="text-xs font-semibold text-[#8a90a3]">
                {Math.round((segment.value / timeDistributionTotal) * 100)}% (
                {segment.value}h)
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
