import { Checkbox } from "@/components/ui/checkbox";
import type { ChannelTask } from "@/components/messages/message-data";

export function ChannelTasksList({
  tasks,
  onToggle
}: {
  tasks: ChannelTask[];
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
      {tasks.map((task) => (
        <div
          className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-[#171a28]"
          key={task.id}
        >
          <Checkbox
            aria-label={`Mark ${task.title} as ${task.done ? "not done" : "done"}`}
            checked={task.done}
            onCheckedChange={() => onToggle(task.id)}
          />
          <span
            className={`flex-1 text-sm font-semibold ${task.done ? "text-[#8a90a3] line-through dark:text-[#7d8299]" : "text-[#11142c] dark:text-[#f1f2f8]"}`}
          >
            {task.title}
          </span>
          <span className="shrink-0 text-xs font-medium text-[#8a90a3] dark:text-[#7d8299]">
            {task.assigneeId}
          </span>
        </div>
      ))}
    </div>
  );
}
