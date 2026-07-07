"use client";

import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { MEMBER_LABELS } from "@/components/projects/project-data";
import { formatDueDate, type Task } from "@/components/tasks/task-data";

export function UpcomingDeadlinesPanel({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  const upcoming = tasks
    .filter((task) => task.status !== "done")
    .map((task) => ({ task, due: new Date(`${task.dueDate}T00:00:00`) }))
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, 4);

  return (
    <DashboardPanel
      action={{ label: "View all", onClick: () => router.push("/calendar") }}
      title="Upcoming Deadlines"
    >
      <div className="grid">
        {upcoming.map(({ task }) => {
          const due = formatDueDate(task.dueDate);

          return (
            <div
              className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0"
              key={task.id}
            >
              <AvatarWithStatus
                label={MEMBER_LABELS[task.assigneeId] ?? "?"}
                userId={task.assigneeId}
              />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-[#11142c]">
                  {task.title}
                </strong>
                <span className="text-xs text-[#8a90a3]">{task.project}</span>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                  due.overdue
                    ? "bg-red-50 text-red-600"
                    : due.label === "Today"
                      ? "bg-red-50 text-red-600"
                      : due.label === "Tomorrow"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-[#654cff]/10 text-[#654cff]"
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
