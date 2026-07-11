import { CheckCircle2, ListTodo } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";

export function MyTasksStatPanel({
  pending,
  completed,
  onViewAll
}: {
  pending: number;
  completed: number;
  onViewAll: () => void;
}) {
  return (
    <DashboardPanel
      action={{ label: "View all", onClick: onViewAll }}
      title="My Tasks"
    >
      <div className="grid grid-cols-2 gap-3 p-5">
        <div className="rounded-xl bg-[#654cff]/[0.06] p-4">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#654cff]/10 text-[#654cff]">
            <ListTodo className="h-4.5 w-4.5" />
          </div>
          <strong className="mt-3 block text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
            {pending}
          </strong>
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            Pending
          </span>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <strong className="mt-3 block text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
            {completed}
          </strong>
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            Completed
          </span>
        </div>
      </div>
    </DashboardPanel>
  );
}
