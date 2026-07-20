import { Checkbox } from "@/components/ui/checkbox";
import { PRIORITY_META, formatDueDate } from "@/components/tasks/task-data";
import type { ProductionTask } from "@/types/base";

export function TaskRow({
  task,
  completed,
  onToggle
}: {
  task: ProductionTask;
  completed: boolean;
  onToggle: (taskId: string) => void;
}) {
  const due = formatDueDate(task.dueDate);

  return (
    <div className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0 dark:border-white/[0.06]">
      <Checkbox
        aria-label={`Complete ${task.title}`}
        checked={completed}
        onCheckedChange={() => onToggle(task.id)}
      />
      <div className="min-w-0 flex-1">
        <strong
          className={`block truncate text-sm font-semibold ${
            completed
              ? "text-[#667085] line-through dark:text-[#7d8299]"
              : "text-[#11142c] dark:text-[#f1f2f8]"
          }`}
        >
          {task.title}
        </strong>
        <span className="text-xs text-[#667085] dark:text-[#7d8299]">
          {task.projectTitle ?? "No Project"}
        </span>
      </div>
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-bold capitalize ${PRIORITY_META[task.priority].badge}`}
      >
        {task.priority}
      </span>
      <time className="text-xs font-medium text-[#667085] dark:text-[#7d8299]">
        {due.label}
      </time>
    </div>
  );
}
