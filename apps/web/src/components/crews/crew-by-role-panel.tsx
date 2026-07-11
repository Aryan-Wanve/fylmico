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
              className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
              key={role}
            >
              <span className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                {role}s
              </span>
              <span className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
