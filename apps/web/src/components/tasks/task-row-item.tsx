import { MessageSquare, Paperclip } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MEMBER_NAMES,
  PRIORITY_META,
  formatDueDate,
  getProjectColor,
  type Task
} from "@/components/tasks/task-data";
import { MEMBER_LABELS } from "@/components/projects/project-data";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { TaskCardMenu } from "@/components/tasks/task-card-menu";

export function TaskRowItem({
  task,
  onToggleComplete,
  onDuplicate,
  onDelete
}: {
  task: Task;
  onToggleComplete: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const isDone = task.status === "done";
  const due = formatDueDate(task.dueDate);
  const projectColor = getProjectColor(task.project);
  const priority = PRIORITY_META[task.priority];

  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015]">
      <Checkbox
        aria-label={`Mark ${task.title} as ${isDone ? "not done" : "done"}`}
        checked={isDone}
        className="data-checked:border-emerald-500 data-checked:bg-emerald-500"
        onCheckedChange={onToggleComplete}
      />

      <div className="min-w-0 flex-1">
        <strong
          className={`block truncate text-sm font-semibold ${
            isDone ? "text-[#8a90a3] line-through" : "text-[#11142c]"
          }`}
        >
          {task.title}
        </strong>
        {task.commentCount || task.attachmentCount ? (
          <div className="mt-0.5 flex items-center gap-3 text-xs text-[#8a90a3]">
            {task.commentCount ? (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task.commentCount}
              </span>
            ) : null}
            {task.attachmentCount ? (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {task.attachmentCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="hidden w-32 shrink-0 items-center gap-2 sm:flex">
        <AvatarWithStatus
          label={MEMBER_LABELS[task.assigneeId] ?? "?"}
          size="sm"
          userId={task.assigneeId}
        />
        <span className="truncate text-sm text-[#4b5268]">
          {MEMBER_NAMES[task.assigneeId]?.split(" ")[0] ?? "Unassigned"}
        </span>
      </div>

      <span
        className={`hidden w-36 shrink-0 truncate rounded-md px-2.5 py-1 text-center text-xs font-bold md:inline-block ${projectColor.bg} ${projectColor.text}`}
      >
        {task.project}
      </span>

      <span
        className={`hidden w-20 shrink-0 text-sm font-semibold sm:block ${
          due.overdue && !isDone ? "text-red-600" : "text-[#4b5268]"
        }`}
      >
        {due.label}
      </span>

      <span
        className={`hidden w-20 shrink-0 rounded-md px-2 py-0.5 text-center text-xs font-bold lg:inline-block ${priority.badge}`}
      >
        {priority.label}
      </span>

      <TaskCardMenu onDelete={onDelete} onDuplicate={onDuplicate} />
    </div>
  );
}
