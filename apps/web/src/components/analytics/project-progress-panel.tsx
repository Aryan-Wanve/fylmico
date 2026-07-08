import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { MultiLineChart } from "@/components/analytics/multi-line-chart";
import {
  projectProgressSeries,
  projectProgressXLabels
} from "@/components/analytics/analytics-data";

export function ProjectProgressPanel() {
  return (
    <DashboardPanel
      action={{ label: "All Projects" }}
      title="Project Progress Overview"
    >
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {projectProgressSeries.map((series) => (
            <div className="flex items-center gap-2" key={series.id}>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <span className="text-xs font-semibold text-[#5f667d]">
                {series.label}
              </span>
            </div>
          ))}
        </div>
        <MultiLineChart
          series={projectProgressSeries}
          xLabels={projectProgressXLabels}
        />
      </div>
    </DashboardPanel>
  );
}
