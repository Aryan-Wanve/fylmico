import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import type { ActivityHeatmap as ActivityHeatmapData } from "@/types/base";

export function ActivityHeatmapPanel({
  heatmap
}: {
  heatmap: ActivityHeatmapData;
}) {
  return (
    <DashboardPanel
      action={{ label: "View full report" }}
      title="Activity Heatmap"
    >
      <ActivityHeatmap heatmap={heatmap} />
    </DashboardPanel>
  );
}
