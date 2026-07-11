"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  updateTask as updateTaskApi
} from "@/services/base-workspace.service";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TasksToolbar, type TasksTab } from "@/components/tasks/tasks-toolbar";
import type { GroupByOption } from "@/components/tasks/tasks-group-by-menu";
import { TaskListColumnHeader } from "@/components/tasks/task-list-column-header";
import { TaskGroupHeader } from "@/components/tasks/task-group-header";
import { TaskRowItem } from "@/components/tasks/task-row-item";
import { TasksEmptyState } from "@/components/tasks/tasks-empty-state";
import { TaskOverviewPanel } from "@/components/tasks/task-overview-panel";
import { TaskPriorityPanel } from "@/components/tasks/task-priority-panel";
import { UpcomingDeadlinesPanel } from "@/components/tasks/upcoming-deadlines-panel";
import { MyTasksStatPanel } from "@/components/tasks/my-tasks-stat-panel";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  getProjectColor,
  type Task,
  type TaskPriority
} from "@/components/tasks/task-data";

type Group = {
  key: string;
  label: string;
  dotClassName: string;
  tasks: Task[];
};

function buildGroups(list: Task[], groupBy: GroupByOption): Group[] {
  if (groupBy === "status") {
    return STATUS_ORDER.map((status) => ({
      key: status,
      label: STATUS_META[status].label,
      dotClassName: STATUS_META[status].dot,
      tasks: list.filter((task) => task.status === status)
    })).filter((group) => group.tasks.length > 0);
  }

  if (groupBy === "priority") {
    return PRIORITY_ORDER.map((priority) => ({
      key: priority,
      label: PRIORITY_META[priority].label,
      dotClassName: PRIORITY_META[priority].dot,
      tasks: list.filter((task) => task.priority === priority)
    })).filter((group) => group.tasks.length > 0);
  }

  if (groupBy === "project") {
    const projectNames = Array.from(
      new Set(list.map((task) => task.project))
    ).sort();

    return projectNames.map((project) => ({
      key: project,
      label: project,
      dotClassName: getProjectColor(project).dot,
      tasks: list.filter((task) => task.project === project)
    }));
  }

  const assigneeIds = Array.from(new Set(list.map((task) => task.assigneeId)));

  return assigneeIds.map((assigneeId) => ({
    key: assigneeId,
    label:
      list.find((task) => task.assigneeId === assigneeId)?.assigneeName ??
      "Unassigned",
    dotClassName: "bg-[#654cff]",
    tasks: list.filter((task) => task.assigneeId === assigneeId)
  }));
}

export function TasksPage() {
  const { workspace, activeHouse, refreshWorkspace } = useWorkspace();
  const currentUserId = workspace.user.id;
  const tasks = workspace.tasks;

  const [activeTab, setActiveTab] = useState<TasksTab>("all");
  const [groupBy, setGroupBy] = useState<GroupByOption>("status");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set()
  );
  const [activePriorities, setActivePriorities] = useState<Set<TaskPriority>>(
    () => new Set(PRIORITY_ORDER)
  );

  const counts: Record<TasksTab, number> = useMemo(
    () => ({
      all: tasks.length,
      "my-tasks": tasks.filter((task) => task.assigneeId === currentUserId)
        .length,
      "assigned-to-me": tasks.filter(
        (task) => task.assigneeId === currentUserId && task.status !== "done"
      ).length,
      completed: tasks.filter((task) => task.status === "done").length
    }),
    [tasks, currentUserId]
  );

  const tabFiltered = tasks.filter((task) => {
    if (activeTab === "my-tasks") {
      return task.assigneeId === currentUserId;
    }
    if (activeTab === "assigned-to-me") {
      return task.assigneeId === currentUserId && task.status !== "done";
    }
    if (activeTab === "completed") {
      return task.status === "done";
    }
    return true;
  });

  const filtered = tabFiltered.filter((task) =>
    activePriorities.has(task.priority)
  );

  const groups = buildGroups(filtered, groupBy);

  function toggleGroupCollapse(key: string) {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleTogglePriority(priority: TaskPriority) {
    setActivePriorities((current) => {
      const next = new Set(current);
      if (next.has(priority)) {
        next.delete(priority);
      } else {
        next.add(priority);
      }
      return next;
    });
  }

  async function toggleComplete(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    try {
      await updateTaskApi(taskId, {
        status: task.status === "done" ? "todo" : "done"
      });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update the task."
      );
    }
  }

  async function handleReassign(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    const members = activeHouse?.members ?? [];
    if (!task || members.length === 0) {
      return;
    }

    const memberNames = members.map((member) => member.name).join(", ");
    const input = window.prompt(
      `Reassign to (${memberNames})`,
      task.assigneeName
    );
    if (input === null) {
      return;
    }

    const matched = members.find(
      (member) => member.name.toLowerCase() === input.trim().toLowerCase()
    );
    if (!matched) {
      window.alert(`"${input}" isn't a member of this house.`);
      return;
    }

    try {
      await updateTaskApi(taskId, { assigneeId: matched.id });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not reassign the task."
      );
    }
  }

  async function handleDuplicate(taskId: string) {
    const source = tasks.find((task) => task.id === taskId);
    if (!source) {
      return;
    }

    try {
      await createTaskApi({
        title: `${source.title} (Copy)`,
        project: source.project,
        assigneeId: source.assigneeId,
        dueDate: source.dueDate,
        priority: source.priority,
        status: source.status
      });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not duplicate the task."
      );
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await deleteTaskApi(taskId);
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete the task."
      );
    }
  }

  async function createTask(defaults: Partial<Task>) {
    const title = window.prompt("Task title");

    if (!title || !title.trim()) {
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    try {
      await createTaskApi({
        title: title.trim(),
        project: defaults.project ?? "General",
        assigneeId: defaults.assigneeId ?? currentUserId,
        dueDate: defaults.dueDate ?? dueDate.toISOString().slice(0, 10),
        priority: defaults.priority ?? "medium",
        status: defaults.status ?? "todo"
      });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the task."
      );
    }
  }

  return (
    <div className="grid gap-6 p-8 xl:grid-cols-[1fr_20rem]">
      <div className="grid min-w-0 gap-4">
        <TasksHeader />
        <TasksToolbar
          activePriorities={activePriorities}
          activeTab={activeTab}
          counts={counts}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          onNewTask={() => createTask({})}
          onTabChange={setActiveTab}
          onTogglePriority={toggleTogglePriority}
        />

        {groups.length === 0 ? (
          <TasksEmptyState />
        ) : (
          <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            <div className="min-w-[42rem]">
              <TaskListColumnHeader />
              {groups.map((group) => {
                const collapsed = collapsedGroups.has(group.key);

                return (
                  <div key={group.key}>
                    <TaskGroupHeader
                      collapsed={collapsed}
                      count={group.tasks.length}
                      dotClassName={group.dotClassName}
                      label={group.label}
                      onAddTask={
                        groupBy === "status"
                          ? () =>
                              createTask({
                                status: group.key as Task["status"]
                              })
                          : undefined
                      }
                      onToggle={() => toggleGroupCollapse(group.key)}
                    />
                    {!collapsed
                      ? group.tasks.map((task) => (
                          <TaskRowItem
                            key={task.id}
                            onDelete={() => handleDelete(task.id)}
                            onDuplicate={() => handleDuplicate(task.id)}
                            onReassign={() => handleReassign(task.id)}
                            onToggleComplete={() => toggleComplete(task.id)}
                            task={task}
                          />
                        ))
                      : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <aside className="grid min-w-0 content-start gap-6">
        <TaskOverviewPanel tasks={tasks} />
        <TaskPriorityPanel tasks={tasks} />
        <UpcomingDeadlinesPanel tasks={tasks} />
        <MyTasksStatPanel
          completed={
            tasks.filter(
              (task) =>
                task.assigneeId === currentUserId && task.status === "done"
            ).length
          }
          onViewAll={() => setActiveTab("my-tasks")}
          pending={
            tasks.filter(
              (task) =>
                task.assigneeId === currentUserId && task.status !== "done"
            ).length
          }
        />
      </aside>
    </div>
  );
}
