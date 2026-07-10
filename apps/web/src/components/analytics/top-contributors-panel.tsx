import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { formatHours } from "@/components/analytics/analytics-data";
import type { AnalyticsContributor } from "@/types/base";

export function TopContributorsPanel({
  contributors
}: {
  contributors: AnalyticsContributor[];
}) {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Top Contributors">
      {contributors.length === 0 ? (
        <p className="p-6 text-center text-sm text-[#8a90a3]">
          No time logged yet.
        </p>
      ) : (
        <div className="grid gap-1 p-2">
          {contributors.map((contributor) => (
            <div
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[0.02]"
              key={contributor.userId}
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
                {formatHours(contributor.hours)}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}
