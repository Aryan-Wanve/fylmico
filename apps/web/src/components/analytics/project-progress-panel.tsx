import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { MultiLineChart } from "@/components/analytics/multi-line-chart";
import type { AnalyticsProjectHoursSeries } from "@/types/base";

export function ProjectProgressPanel({
  series,
  xLabels
}: {
  series: AnalyticsProjectHoursSeries[];
  xLabels: string[];
}) {
  return (
    <DashboardPanel
      action={{ label: "All Projects" }}
      title="Hours Logged by Project"
    >
      <div className="p-6">
        {series.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8a90a3]">
            Log time against a project to see it charted here.
          </p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {series.map((line) => (
                <div className="flex items-center gap-2" key={line.id}>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: line.color }}
                  />
                  <span className="text-xs font-semibold text-[#5f667d]">
                    {line.label}
                  </span>
                </div>
              ))}
            </div>
            <MultiLineChart series={series} valueSuffix="h" xLabels={xLabels} />
          </>
        )}
      </div>
    </DashboardPanel>
  );
}
