import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { topContributors } from "@/components/analytics/analytics-data";

export function TopContributorsPanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Top Contributors">
      <div className="grid gap-1 p-2">
        {topContributors.map((contributor) => (
          <div
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[0.02]"
            key={contributor.id}
          >
            <AvatarWithStatus
              label={contributor.name.charAt(0)}
              size="default"
              userId={contributor.userId}
            />
            <strong className="min-w-0 flex-1 truncate text-sm font-semibold text-[#11142c]">
              {contributor.name}
            </strong>
            <span className="shrink-0 rounded-md bg-black/[0.04] px-2 py-1 text-xs font-bold text-[#5f667d]">
              {contributor.hours}
            </span>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
