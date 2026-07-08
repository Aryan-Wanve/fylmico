import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";

export function ActivityHeatmapPanel() {
  return (
    <DashboardPanel
      action={{ label: "View full report" }}
      title="Activity Heatmap"
    >
      <ActivityHeatmap />
    </DashboardPanel>
  );
}
