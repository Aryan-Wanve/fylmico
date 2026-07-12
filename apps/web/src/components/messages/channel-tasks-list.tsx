import { Checkbox } from "@/components/ui/checkbox";
import type { ProductionTask } from "@/types/base";

export function ChannelTasksList({
  tasks,
  onToggle
}: {
  tasks: ProductionTask[];
  onToggle: (taskId: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
        No tasks linked to this channel yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {tasks.map((task) => {
        const done = task.status === "done";

        return (
          <div
            className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-[#171a28]"
            key={task.id}
          >
            <Checkbox
              aria-label={`Mark ${task.title} as ${done ? "not done" : "done"}`}
              checked={done}
              onCheckedChange={() => onToggle(task.id)}
            />
            <span
              className={`flex-1 text-sm font-semibold ${done ? "text-[#8a90a3] line-through dark:text-[#7d8299]" : "text-[#11142c] dark:text-[#f1f2f8]"}`}
            >
              {task.title}
            </span>
            <span className="shrink-0 text-xs font-medium text-[#8a90a3] dark:text-[#7d8299]">
              {task.assigneeName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
