import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { activities } from "@/components/dashboard/activity-data";

export function RecentActivityPanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Recent Activity">
      <div className="grid">
        {activities.map((activity) => (
          <ActivityRow activity={activity} key={activity.id} />
        ))}
      </div>
    </DashboardPanel>
  );
}
