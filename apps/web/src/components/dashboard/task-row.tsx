import { Checkbox } from "@/components/ui/checkbox";
import type { ProductionTask } from "@/types/base";

const PRIORITY_STYLES: Record<ProductionTask["priority"], string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-orange-50 text-orange-600",
  low: "bg-blue-50 text-blue-600"
};

export function TaskRow({
  task,
  completed,
  onToggle
}: {
  task: ProductionTask;
  completed: boolean;
  onToggle: (taskId: string) => void;
}) {
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
              ? "text-[#8a90a3] line-through dark:text-[#7d8299]"
              : "text-[#11142c] dark:text-[#f1f2f8]"
          }`}
        >
          {task.title}
        </strong>
        <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
          {task.project}
        </span>
      </div>
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-bold capitalize ${PRIORITY_STYLES[task.priority]}`}
      >
        {task.priority}
      </span>
      <time className="text-xs font-medium text-[#8a90a3] dark:text-[#7d8299]">
        {task.dueDate}
      </time>
    </div>
  );
}
