import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { MiniAreaChart } from "@/components/analytics/mini-area-chart";
import { formatHours } from "@/components/analytics/analytics-data";
import type { TimeLoggedDay } from "@/types/base";

export function TimeLoggedPanel({
  timeLoggedByDay
}: {
  timeLoggedByDay: TimeLoggedDay[];
}) {
  const points = timeLoggedByDay.map((day) => day.hours);
  const xLabels = timeLoggedByDay.map((day) => day.label);
  const total = points.reduce((sum, value) => sum + value, 0);
  const peakHours = points.length > 0 ? Math.max(...points) : 0;
  const hasSignal = points.some((value) => value > 0);

  return (
    <DashboardPanel action={{ label: "View all" }} title="Time Logged">
      <div className="p-6 pt-4">
        <strong className="block text-2xl font-black text-[#11142c]">
          {formatHours(total)}
        </strong>
        <span className="text-xs font-semibold text-[#8a90a3]">
          Total this week
        </span>
        <div className="mt-4">
          {hasSignal ? (
            <MiniAreaChart
              peakLabel={formatHours(peakHours)}
              points={points}
              xLabels={xLabels}
            />
          ) : (
            <p className="py-6 text-center text-sm text-[#8a90a3]">
              No time logged this week yet.
            </p>
          )}
        </div>
      </div>
    </DashboardPanel>
  );
}
