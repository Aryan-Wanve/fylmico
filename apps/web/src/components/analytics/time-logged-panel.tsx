import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { MiniAreaChart } from "@/components/analytics/mini-area-chart";
import {
  timeLoggedPoints,
  timeLoggedTotalLabel,
  timeLoggedXLabels
} from "@/components/analytics/analytics-data";

export function TimeLoggedPanel() {
  const peakHours = Math.max(...timeLoggedPoints);

  return (
    <DashboardPanel action={{ label: "View all" }} title="Time Logged">
      <div className="p-6 pt-4">
        <strong className="block text-2xl font-black text-[#11142c]">
          {timeLoggedTotalLabel}
        </strong>
        <span className="text-xs font-semibold text-[#8a90a3]">
          Total this week
        </span>
        <div className="mt-4">
          <MiniAreaChart
            peakLabel={`${peakHours}h`}
            points={timeLoggedPoints}
            xLabels={timeLoggedXLabels}
          />
        </div>
      </div>
    </DashboardPanel>
  );
}
