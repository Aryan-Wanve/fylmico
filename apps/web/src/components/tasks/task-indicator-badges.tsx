import { formatDueDate } from "@/components/tasks/task-data";
import type { ProductionTask } from "@/types/base";

export function TaskIndicatorBadges({ task }: { task: ProductionTask }) {
  const due = formatDueDate(task.dueDate);
  const isOpen = task.status !== "completed" && task.status !== "archived";
  const badges: { label: string; className: string }[] = [];

  if (task.isBlocked) {
    badges.push({ label: "Blocked", className: "bg-red-50 text-red-600" });
  }
  if (isOpen && due.overdue) {
    badges.push({ label: "Overdue", className: "bg-red-50 text-red-600" });
  } else if (isOpen && due.label === "Today") {
    badges.push({
      label: "Due Today",
      className: "bg-orange-50 text-orange-600"
    });
  } else if (isOpen && due.label === "Tomorrow") {
    badges.push({
      label: "Due Tomorrow",
      className: "bg-amber-50 text-amber-600"
    });
  }
  if (task.status === "review") {
    badges.push({
      label: "Waiting for Review",
      className: "bg-purple-50 text-purple-600"
    });
  }
  if (task.priority === "urgent" || task.priority === "high") {
    badges.push({
      label: task.priority === "urgent" ? "Urgent" : "High Priority",
      className: "bg-red-50 text-red-600"
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {badges.map((badge) => (
        <span
          className={`rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold ${badge.className}`}
          key={badge.label}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
