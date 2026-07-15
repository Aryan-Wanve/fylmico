"use client";

import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { TaskRow } from "@/components/dashboard/task-row";
import { useWorkspace } from "@/lib/workspace-context";
import { updateTask } from "@/services/base-workspace.service";

export function MyTasksPanel() {
  const { workspace, refreshWorkspace } = useWorkspace();
  const router = useRouter();

  async function handleToggle(taskId: string) {
    const task = workspace.tasks.find((item) => item.id === taskId);
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

  return (
    <DashboardPanel
      action={{ label: "View all", onClick: () => router.push("/tasks") }}
      title="My Tasks"
    >
      <div className="grid grid-cols-1">
        {workspace.tasks.slice(0, 4).map((task) => (
          <TaskRow
            completed={task.status === "completed"}
            key={task.id}
            onToggle={handleToggle}
            task={task}
          />
        ))}
      </div>
    </DashboardPanel>
  );
}
