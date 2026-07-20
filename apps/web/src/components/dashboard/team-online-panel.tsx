"use client";

import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { usePresence } from "@/lib/realtime/use-presence";
import { useWorkspace } from "@/lib/workspace-context";

export function TeamOnlinePanel() {
  const router = useRouter();
  const { workspace, activeHouse } = useWorkspace();
  const onlineUserIds = usePresence(
    activeHouse?.id ?? null,
    workspace.user.id,
    workspace.user.name
  );
  const members = activeHouse?.members ?? [];

  return (
    <DashboardPanel
      action={{ label: "View Crew", onClick: () => router.push("/crews") }}
      title="Team Online"
    >
      <div className="grid gap-2.5 p-5">
        {members.length > 0 ? (
          members.map((member) => (
            <div className="flex items-center gap-2.5" key={member.id}>
              <AvatarWithStatus
                label={member.name.slice(0, 2).toUpperCase()}
                size="sm"
                status={onlineUserIds.has(member.id) ? "online" : "offline"}
                userId={member.id}
              />
              <div className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {member.name}
                </strong>
                <span className="text-xs text-[#667085] dark:text-[#7d8299]">
                  {member.role}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-[#667085] dark:text-[#7d8299]">
            No crew members yet.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
