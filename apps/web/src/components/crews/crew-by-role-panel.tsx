import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  ROLE_CATEGORY_ORDER,
  type CrewMember
} from "@/components/crews/crew-data";

export function CrewByRolePanel({ members }: { members: CrewMember[] }) {
  return (
    <DashboardPanel title="Crew by Role">
      <div className="grid gap-1 p-3">
        {ROLE_CATEGORY_ORDER.map((role) => {
          const count = members.filter(
            (member) => member.roleCategory === role
          ).length;

          return (
            <div
              className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-black/[0.02]"
              key={role}
            >
              <span className="text-sm font-semibold text-[#3a3f57]">
                {role}s
              </span>
              <span className="text-sm font-bold text-[#11142c]">{count}</span>
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
