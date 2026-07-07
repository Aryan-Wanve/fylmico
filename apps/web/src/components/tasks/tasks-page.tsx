"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
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
  MEMBER_NAMES,
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  getProjectColor,
  tasks as defaultTasks,
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
    label: MEMBER_NAMES[assigneeId] ?? "Unassigned",
    dotClassName: "bg-[#654cff]",
    tasks: list.filter((task) => task.assigneeId === assigneeId)
  }));
}

export function TasksPage() {
  const { workspace } = useWorkspace();
  const currentUserId = workspace.user.id;

  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set()
  );
  const [activeTab, setActiveTab] = useState<TasksTab>("all");
  const [groupBy, setGroupBy] = useState<GroupByOption>("status");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set()
  );
  const [activePriorities, setActivePriorities] = useState<Set<TaskPriority>>(
    () => new Set(PRIORITY_ORDER)
  );

  const effectiveTasks = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        status: completedIds.has(task.id) ? ("done" as const) : task.status
      })),
    [tasks, completedIds]
  );

  const counts: Record<TasksTab, number> = {
    all: effectiveTasks.length,
    "my-tasks": effectiveTasks.filter(
      (task) => task.assigneeId === currentUserId
    ).length,
    "assigned-to-me": effectiveTasks.filter(
      (task) => task.assigneeId === currentUserId && task.status !== "done"
    ).length,
    completed: effectiveTasks.filter((task) => task.status === "done").length
  };

  const tabFiltered = effectiveTasks.filter((task) => {
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

  function toggleComplete(taskId: string) {
    setCompletedIds((current) => {
      const next = new Set(current);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }

  function handleDuplicate(taskId: string) {
    setTasks((current) => {
      const source = current.find((task) => task.id === taskId);
      if (!source) {
        return current;
      }
      const index = current.indexOf(source);
      const copy: Task = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        title: `${source.title} (Copy)`
      };
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
  }

  function handleDelete(taskId: string) {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setCompletedIds((current) => {
      if (!current.has(taskId)) {
        return current;
      }
      const next = new Set(current);
      next.delete(taskId);
      return next;
    });
  }

  function createTask(defaults: Partial<Task>) {
    const title = window.prompt("Task title");

    if (!title || !title.trim()) {
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const task: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      project: defaults.project ?? "General",
      assigneeId: defaults.assigneeId ?? currentUserId,
      dueDate: defaults.dueDate ?? dueDate.toISOString().slice(0, 10),
      priority: defaults.priority ?? "medium",
      status: defaults.status ?? "todo"
    };

    setTasks((current) => [task, ...current]);
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
          <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
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
        <TaskOverviewPanel tasks={effectiveTasks} />
        <TaskPriorityPanel tasks={effectiveTasks} />
        <UpcomingDeadlinesPanel tasks={effectiveTasks} />
        <MyTasksStatPanel
          completed={
            effectiveTasks.filter(
              (task) =>
                task.assigneeId === currentUserId && task.status === "done"
            ).length
          }
          onViewAll={() => setActiveTab("my-tasks")}
          pending={
            effectiveTasks.filter(
              (task) =>
                task.assigneeId === currentUserId && task.status !== "done"
            ).length
          }
        />
      </aside>
    </div>
  );
}
