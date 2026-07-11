"use client";

import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { TaskRow } from "@/components/dashboard/task-row";
import { useWorkspace } from "@/lib/workspace-context";

export function MyTasksPanel({
  completedTaskIds,
  onToggleTask
}: {
  completedTaskIds: Set<string>;
  onToggleTask: (taskId: string) => void;
}) {
  const { workspace } = useWorkspace();
  const router = useRouter();

  return (
    <DashboardPanel
      action={{ label: "View all", onClick: () => router.push("/tasks") }}
      title="My Tasks"
    >
      <div className="grid">
        {workspace.tasks.slice(0, 4).map((task) => (
          <TaskRow
            completed={completedTaskIds.has(task.id)}
            key={task.id}
            onToggle={onToggleTask}
            task={task}
          />
        ))}
      </div>
    </DashboardPanel>
  );
}
