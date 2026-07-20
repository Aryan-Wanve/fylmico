import { Checkbox } from "@/components/ui/checkbox";
import {
  PRIORITY_META,
  STATUS_META,
  TASK_TYPE_LABELS,
  formatDueDate
} from "@/components/tasks/task-data";
import { OwnerBadge } from "@/components/owners/owner-badge";
import type { ProductionTask } from "@/types/base";

export function TaskTableView({
  tasks,
  selectedIds,
  onToggleSelect,
  onOpen
}: {
  tasks: ProductionTask[];
  selectedIds: Set<string>;
  onToggleSelect: (taskId: string) => void;
  onOpen: (taskId: string) => void;
}) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <table className="w-full min-w-[52rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/5 text-left text-xs font-bold tracking-wide text-[#667085] uppercase dark:border-white/[0.06] dark:text-[#7d8299]">
            <th className="w-10 px-4 py-2.5" />
            <th className="px-2 py-2.5">Task</th>
            <th className="px-2 py-2.5">Type</th>
            <th className="px-2 py-2.5">Status</th>
            <th className="px-2 py-2.5">Priority</th>
            <th className="px-2 py-2.5">Assignees</th>
            <th className="px-2 py-2.5">Owner</th>
            <th className="px-2 py-2.5">Due</th>
            <th className="px-2 py-2.5">Progress</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const due = formatDueDate(task.dueDate);

            return (
              <tr
                className="cursor-pointer border-b border-black/5 last:border-b-0 hover:bg-black/[0.015] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
                key={task.id}
                onClick={() => onOpen(task.id)}
              >
                <td
                  className="px-4 py-2.5"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    aria-label={`Select ${task.title}`}
                    checked={selectedIds.has(task.id)}
                    onCheckedChange={() => onToggleSelect(task.id)}
                  />
                </td>
                <td className="max-w-56 truncate px-2 py-2.5 font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {task.title}
                </td>
                <td className="px-2 py-2.5 text-[#4b5268] dark:text-[#c7cad9]">
                  {TASK_TYPE_LABELS[task.type]}
                </td>
                <td className="px-2 py-2.5">
                  <span className="flex items-center gap-1.5 font-semibold text-[#4b5268] dark:text-[#c7cad9]">
                    <span
                      className={`h-2 w-2 rounded-full ${STATUS_META[task.status].dot}`}
                    />
                    {STATUS_META[task.status].label}
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${PRIORITY_META[task.priority].badge}`}
                  >
                    {PRIORITY_META[task.priority].label}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-[#4b5268] dark:text-[#c7cad9]">
                  {task.assignees.length === 0
                    ? "Unassigned"
                    : task.assignees.length > 1
                      ? `${task.assignees[0].name} +${task.assignees.length - 1}`
                      : task.assignees[0].name}
                </td>
                <td className="max-w-32 px-2 py-2.5">
                  <OwnerBadge
                    ownerName={task.ownerName}
                    ownerType={task.ownerType}
                  />
                </td>
                <td
                  className={`px-2 py-2.5 font-semibold ${due.overdue ? "text-red-600" : "text-[#4b5268] dark:text-[#c7cad9]"}`}
                >
                  {due.label}
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[var(--fylmico-accent)]"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#667085] dark:text-[#7d8299]">
                      {task.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
