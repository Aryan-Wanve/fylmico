import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  type Task
} from "@/components/tasks/task-data";

export function TaskPriorityPanel({ tasks }: { tasks: Task[] }) {
  const total = tasks.length || 1;

  return (
    <DashboardPanel title="Task Priority">
      <div className="grid gap-4 p-5">
        {PRIORITY_ORDER.map((priority) => {
          const count = tasks.filter(
            (task) => task.priority === priority
          ).length;
          const meta = PRIORITY_META[priority];

          return (
            <div key={priority}>
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`rounded-md px-2 py-0.5 font-bold ${meta.badge}`}
                >
                  {meta.label}
                </span>
                <span className="font-bold text-[#11142c]">{count}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className={`h-full rounded-full ${meta.bar}`}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
