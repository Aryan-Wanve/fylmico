import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import type { AnalyticsWorkloadEntry } from "@/types/base";

export function TeamWorkloadPanel({
  workload
}: {
  workload: AnalyticsWorkloadEntry[];
}) {
  return (
    <DashboardPanel title="Team Workload">
      {workload.length === 0 ? (
        <p className="p-6 text-center text-sm text-[#8a90a3]">
          No time logged this week yet.
        </p>
      ) : (
        <div className="grid gap-3 p-4">
          {workload.map((member) => (
            <div className="flex items-center gap-3" key={member.userId}>
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
                {member.jobTitle ? (
                  <span className="text-xs text-[#8a90a3]">
                    {member.jobTitle}
                  </span>
                ) : null}
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
      )}
    </DashboardPanel>
  );
}
