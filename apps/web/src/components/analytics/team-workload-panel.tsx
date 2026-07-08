import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { teamWorkload } from "@/components/analytics/analytics-data";

export function TeamWorkloadPanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Team Workload">
      <div className="grid gap-3 p-4">
        {teamWorkload.map((member) => (
          <div className="flex items-center gap-3" key={member.id}>
            <AvatarWithStatus
              label={member.name.charAt(0)}
              size="default"
              userId={member.userId}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <strong className="truncate text-sm font-semibold text-[#11142c]">
                  {member.name}
                </strong>
                <span className="shrink-0 text-xs font-bold text-[#5f667d]">
                  {member.percentage}%
                </span>
              </div>
              <span className="text-xs text-[#8a90a3]">{member.role}</span>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-[#654cff]"
                  style={{ width: `${member.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
