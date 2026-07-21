import { MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PRIORITY_META,
  TASK_TYPE_LABELS,
  formatDueDate,
  toInitials
} from "@/components/tasks/task-data";
import { TaskIndicatorBadges } from "@/components/tasks/task-indicator-badges";
import { OwnerBadge } from "@/components/owners/owner-badge";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { TaskCardMenu } from "@/components/tasks/task-card-menu";
import type { ProductionTask } from "@/types/base";

export function TaskRowItem({
  task,
  selected,
  onToggleSelect,
  onOpen,
  onToggleComplete,
  onUploadShootData,
  onDuplicate,
  onSaveAsTemplate,
  onDelete
}: {
  task: ProductionTask;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onToggleComplete: () => void;
  onUploadShootData?: () => void;
  onDuplicate: () => void;
  onSaveAsTemplate: () => void;
  onDelete: () => void;
}) {
  const isDone = task.status === "completed";
  const due = formatDueDate(task.dueDate);
  const priority = PRIORITY_META[task.priority];
  const checklistDone = task.checklistItems.filter((item) => item.done).length;

  return (
    <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015] dark:border-white/[0.06] dark:hover:bg-white/[0.03]">
      <Checkbox
        aria-label={`Select ${task.title}`}
        checked={selected}
        onCheckedChange={onToggleSelect}
      />
      <Checkbox
        aria-label={`Mark ${task.title} as ${isDone ? "not done" : "done"}`}
        checked={isDone}
        className="data-checked:border-emerald-500 data-checked:bg-emerald-500"
        onCheckedChange={onToggleComplete}
      />

      <button
        className="min-w-0 flex-1 text-left"
        onClick={onOpen}
        type="button"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <strong
            className={`truncate text-sm font-semibold ${
              isDone
                ? "text-[#667085] line-through dark:text-[#878ca0]"
                : "text-[#11142c] dark:text-[#f1f2f8]"
            }`}
          >
            {task.title}
          </strong>
          <TaskIndicatorBadges task={task} />
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-[#667085] dark:text-[#878ca0]">
          <span>{TASK_TYPE_LABELS[task.type]}</span>
          {task.subtasks.length ? (
            <span>
              {task.subtasks.filter((s) => s.status === "completed").length}/
              {task.subtasks.length} subtasks
            </span>
          ) : null}
          {task.checklistItems.length ? (
            <span>
              {checklistDone}/{task.checklistItems.length} checklist
            </span>
          ) : null}
          {task.commentCount ? (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {task.commentCount}
            </span>
          ) : null}
        </div>
      </button>

      <div className="hidden w-28 shrink-0 items-center -space-x-2 sm:flex">
        {task.assignees.length === 0 ? (
          <span className="text-xs text-[#667085] dark:text-[#878ca0]">
            Unassigned
          </span>
        ) : (
          task.assignees
            .slice(0, 3)
            .map((assignee) => (
              <AvatarWithStatus
                imageUrl={assignee.avatarUrl}
                key={assignee.userId}
                label={toInitials(assignee.name)}
                size="sm"
                userId={assignee.userId}
              />
            ))
        )}
        {task.assignees.length > 3 ? (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-black/[0.06] text-[0.6rem] font-bold text-[#4b5268] dark:bg-white/[0.08] dark:text-[#c7cad9]">
            +{task.assignees.length - 3}
          </span>
        ) : null}
      </div>

      <div className="hidden w-36 shrink-0 md:block">
        <OwnerBadge ownerName={task.ownerName} ownerType={task.ownerType} />
      </div>

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
        onSaveAsTemplate={onSaveAsTemplate}
        onUploadShootData={
          task.shootId && isDone ? onUploadShootData : undefined
        }
      />
    </div>
  );
}
