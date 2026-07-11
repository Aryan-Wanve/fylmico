import { MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PRIORITY_META,
  formatDueDate,
  getProjectColor,
  toInitials,
  type Task
} from "@/components/tasks/task-data";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { TaskCardMenu } from "@/components/tasks/task-card-menu";

export function TaskRowItem({
  task,
  onToggleComplete,
  onDuplicate,
  onDelete,
  onReassign
}: {
  task: Task;
  onToggleComplete: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReassign: () => void;
}) {
  const isDone = task.status === "done";
  const due = formatDueDate(task.dueDate);
  const projectColor = getProjectColor(task.project);
  const priority = PRIORITY_META[task.priority];

  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015] dark:border-white/[0.06] dark:hover:bg-white/[0.03]">
      <Checkbox
        aria-label={`Mark ${task.title} as ${isDone ? "not done" : "done"}`}
        checked={isDone}
        className="data-checked:border-emerald-500 data-checked:bg-emerald-500"
        onCheckedChange={onToggleComplete}
      />

      <div className="min-w-0 flex-1">
        <strong
          className={`block truncate text-sm font-semibold ${
            isDone
              ? "text-[#8a90a3] line-through dark:text-[#7d8299]"
              : "text-[#11142c] dark:text-[#f1f2f8]"
          }`}
        >
          {task.title}
        </strong>
        {task.commentCount ? (
          <div className="mt-0.5 flex items-center gap-3 text-xs text-[#8a90a3] dark:text-[#7d8299]">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {task.commentCount}
            </span>
          </div>
        ) : null}
      </div>

      <div className="hidden w-32 shrink-0 items-center gap-2 sm:flex">
        <AvatarWithStatus
          label={toInitials(task.assigneeName)}
          size="sm"
          userId={task.assigneeId}
        />
        <span className="truncate text-sm text-[#4b5268] dark:text-[#c7cad9]">
          {task.assigneeName.split(" ")[0]}
        </span>
      </div>

      <span
        className={`hidden w-36 shrink-0 truncate rounded-md px-2.5 py-1 text-center text-xs font-bold md:inline-block ${projectColor.bg} ${projectColor.text}`}
      >
        {task.project}
      </span>

      <span
        className={`hidden w-20 shrink-0 text-sm font-semibold sm:block ${
          due.overdue && !isDone
            ? "text-red-600"
            : "text-[#4b5268] dark:text-[#c7cad9]"
        }`}
      >
        {due.label}
      </span>

      <span
        className={`hidden w-20 shrink-0 rounded-md px-2 py-0.5 text-center text-xs font-bold lg:inline-block ${priority.badge}`}
      >
        {priority.label}
      </span>

      <TaskCardMenu
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onReassign={onReassign}
      />
    </div>
  );
}
