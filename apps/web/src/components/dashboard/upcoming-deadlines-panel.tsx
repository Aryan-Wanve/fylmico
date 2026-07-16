"use client";

import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { PRIORITY_META } from "@/components/tasks/task-data";
import { useWorkspace } from "@/lib/workspace-context";
import type { ProductionTask } from "@/types/base";

function formatCountdown(dueDate: string): { label: string; overdue: boolean } {
  const diffMs = new Date(dueDate).getTime() - Date.now();
  if (diffMs < 0) {
    return { label: "Overdue", overdue: true };
  }

  const diffHours = diffMs / (60 * 60 * 1000);
  if (diffHours < 24) {
    return {
      label: `${Math.max(1, Math.round(diffHours))}h left`,
      overdue: false
    };
  }

  return { label: `${Math.round(diffHours / 24)}d left`, overdue: false };
}

export function UpcomingDeadlinesPanel({
  excludeTaskId
}: {
  excludeTaskId?: string;
}) {
  const { workspace } = useWorkspace();
  const router = useRouter();

  const deadlines: ProductionTask[] = workspace.tasks
    .filter(
      (task) =>
        task.id !== excludeTaskId &&
        task.dueDate !== null &&
        task.status !== "completed" &&
        task.status !== "archived" &&
        task.assignees.some((assignee) => assignee.userId === workspace.user.id)
    )
    .sort((a, b) => (a.dueDate as string).localeCompare(b.dueDate as string))
    .slice(0, 4);

  return (
    <DashboardPanel
      action={{ label: "View All", onClick: () => router.push("/tasks") }}
      title="Upcoming Deadline"
    >
      <div className="grid gap-1">
        {deadlines.length > 0 ? (
          deadlines.map((task) => {
            const countdown = formatCountdown(task.dueDate as string);
            return (
              <div
                className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0 dark:border-white/[0.06]"
                key={task.id}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_META[task.priority].dot}`}
                />
                <strong className="min-w-0 flex-1 truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {task.title}
                </strong>
                <span
                  className={`text-xs font-bold ${countdown.overdue ? "text-red-600" : "text-[#8a90a3] dark:text-[#7d8299]"}`}
                >
                  {countdown.label}
                </span>
              </div>
            );
          })
        ) : (
          <p className="px-6 py-8 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
            No upcoming deadlines.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
