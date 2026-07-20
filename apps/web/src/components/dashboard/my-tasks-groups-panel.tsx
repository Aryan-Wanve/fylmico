"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { TaskRow } from "@/components/dashboard/task-row";
import { toISODate } from "@/lib/calendar-utils";
import { useWorkspace } from "@/lib/workspace-context";
import { updateTask } from "@/services/base-workspace.service";
import type { ProductionTask } from "@/types/base";

type GroupKey = "active" | "today" | "upcoming" | "review" | "blocked" | "done";

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "review", label: "Review" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" }
];

function groupTasks(
  tasks: ProductionTask[]
): Record<GroupKey, ProductionTask[]> {
  const today = toISODate(new Date());

  return {
    active: tasks.filter(
      (task) => task.status === "todo" || task.status === "in-progress"
    ),
    today: tasks.filter((task) => task.dueDate?.slice(0, 10) === today),
    upcoming: tasks.filter(
      (task) =>
        task.dueDate !== null &&
        task.dueDate.slice(0, 10) > today &&
        task.status !== "completed" &&
        task.status !== "archived"
    ),
    review: tasks.filter(
      (task) => task.status === "review" || task.status === "changes-requested"
    ),
    blocked: tasks.filter((task) => task.isBlocked),
    done: tasks.filter((task) => task.status === "completed")
  };
}

export function MyTasksGroupsPanel() {
  const { workspace, refreshWorkspace } = useWorkspace();
  const router = useRouter();
  const [activeGroup, setActiveGroup] = useState<GroupKey>("active");

  const myTasks = workspace.tasks.filter((task) =>
    task.assignees.some((assignee) => assignee.userId === workspace.user.id)
  );
  const groups = groupTasks(myTasks);

  async function handleToggle(taskId: string) {
    const task = myTasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    try {
      await updateTask(taskId, {
        status: task.status === "completed" ? "todo" : "completed"
      });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update the task."
      );
    }
  }

  const visible = groups[activeGroup];

  return (
    <DashboardPanel
      action={{ label: "View All Tasks", onClick: () => router.push("/tasks") }}
      title="My Tasks"
    >
      <div className="flex gap-1 overflow-x-auto border-b border-black/5 px-4 pt-3 dark:border-white/[0.06]">
        {GROUPS.map((group) => (
          <button
            className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-bold whitespace-nowrap ${
              activeGroup === group.key
                ? "text-[var(--fylmico-accent)]"
                : "text-[#8a90a3] dark:text-[#7d8299]"
            }`}
            key={group.key}
            onClick={() => setActiveGroup(group.key)}
            type="button"
          >
            {group.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                activeGroup === group.key
                  ? "bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]"
                  : "bg-black/[0.04] text-[#8a90a3] dark:bg-white/[0.06] dark:text-[#7d8299]"
              }`}
            >
              {groups[group.key].length}
            </span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1">
        {visible.length > 0 ? (
          visible
            .slice(0, 6)
            .map((task) => (
              <TaskRow
                completed={task.status === "completed"}
                key={task.id}
                onToggle={handleToggle}
                task={task}
              />
            ))
        ) : (
          <p className="px-6 py-8 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
            Nothing here.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
