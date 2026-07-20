"use client";

import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { formatDueDate, toInitials } from "@/components/tasks/task-data";
import type { ProductionTask } from "@/types/base";

export function UpcomingDeadlinesPanel({ tasks }: { tasks: ProductionTask[] }) {
  const router = useRouter();

  const upcoming = tasks
    .filter(
      (task) =>
        task.dueDate &&
        task.status !== "completed" &&
        task.status !== "archived"
    )
    .map((task) => ({ task, due: new Date(task.dueDate as string) }))
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, 4);

  return (
    <DashboardPanel
      action={{ label: "View all", onClick: () => router.push("/calendar") }}
      title="Upcoming Deadlines"
    >
      <div className="grid grid-cols-1">
        {upcoming.map(({ task }) => {
          const due = formatDueDate(task.dueDate);
          const firstAssignee = task.assignees[0];

          return (
            <div
              className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0 dark:border-white/[0.06]"
              key={task.id}
            >
              <AvatarWithStatus
                label={toInitials(firstAssignee?.name ?? "?")}
                userId={firstAssignee?.userId ?? ""}
              />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {task.title}
                </strong>
                <span className="text-xs text-[#667085] dark:text-[#7d8299]">
                  {task.projectTitle ?? "No Project"}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                  due.overdue
                    ? "bg-red-50 text-red-600"
                    : due.label === "Today"
                      ? "bg-red-50 text-red-600"
                      : due.label === "Tomorrow"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]"
                }`}
              >
                {due.label}
              </span>
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
