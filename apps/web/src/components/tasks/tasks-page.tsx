"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { useUploadQueue } from "@/lib/uploads/use-upload-queue";
import {
  createTask as createTaskApi,
  createTaskFromTemplate,
  deleteTask as deleteTaskApi,
  duplicateTaskRequest,
  finishAndUploadShoot,
  getShoot,
  getShootUploadFolder,
  markShootUploaded,
  saveTaskAsTemplate,
  updateTask as updateTaskApi
} from "@/services/base-workspace.service";
import { TasksHeader } from "@/components/tasks/tasks-header";
import {
  TasksToolbar,
  type TasksTab,
  type TasksViewMode
} from "@/components/tasks/tasks-toolbar";
import type { GroupByOption } from "@/components/tasks/tasks-group-by-menu";
import { TaskListColumnHeader } from "@/components/tasks/task-list-column-header";
import { TaskGroupHeader } from "@/components/tasks/task-group-header";
import { TaskRowItem } from "@/components/tasks/task-row-item";
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";
import { TaskTableView } from "@/components/tasks/task-table-view";
import { TasksEmptyState } from "@/components/tasks/tasks-empty-state";
import { TaskOverviewPanel } from "@/components/tasks/task-overview-panel";
import { TaskPriorityPanel } from "@/components/tasks/task-priority-panel";
import { UpcomingDeadlinesPanel } from "@/components/tasks/upcoming-deadlines-panel";
import { MyTasksStatPanel } from "@/components/tasks/my-tasks-stat-panel";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import { TaskTemplatesPopover } from "@/components/tasks/task-templates-popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  TASK_TYPES,
  TASK_TYPE_LABELS,
  getProjectColor
} from "@/components/tasks/task-data";
import type {
  OwnerType,
  ProductionTask,
  TaskPriority,
  TaskStatus,
  TaskType
} from "@/types/base";

type Group = {
  key: string;
  label: string;
  dotClassName: string;
  tasks: ProductionTask[];
};

function buildGroups(list: ProductionTask[], groupBy: GroupByOption): Group[] {
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

  if (groupBy === "type") {
    return TASK_TYPES.map((type) => ({
      key: type,
      label: TASK_TYPE_LABELS[type],
      dotClassName: "bg-[#654cff]",
      tasks: list.filter((task) => task.type === type)
    })).filter((group) => group.tasks.length > 0);
  }

  if (groupBy === "project") {
    const projectNames = Array.from(
      new Set(list.map((task) => task.projectTitle ?? "No Project"))
    ).sort();

    return projectNames.map((project) => ({
      key: project,
      label: project,
      dotClassName: getProjectColor(project === "No Project" ? null : project)
        .dot,
      tasks: list.filter(
        (task) => (task.projectTitle ?? "No Project") === project
      )
    }));
  }

  if (groupBy === "client") {
    const clientNames = Array.from(
      new Set(list.map((task) => task.clientName ?? "No Client"))
    ).sort();

    return clientNames.map((client) => ({
      key: client,
      label: client,
      dotClassName: "bg-[#654cff]",
      tasks: list.filter((task) => (task.clientName ?? "No Client") === client)
    }));
  }

  const assigneeIds = Array.from(
    new Set(list.map((task) => task.assignees[0]?.userId ?? "unassigned"))
  );

  return assigneeIds.map((assigneeId) => ({
    key: assigneeId,
    label:
      list.find(
        (task) => (task.assignees[0]?.userId ?? "unassigned") === assigneeId
      )?.assignees[0]?.name ?? "Unassigned",
    dotClassName: "bg-[#654cff]",
    tasks: list.filter(
      (task) => (task.assignees[0]?.userId ?? "unassigned") === assigneeId
    )
  }));
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function TasksPage() {
  const { workspace, activeHouse, refreshWorkspace } = useWorkspace();
  const { enqueue } = useUploadQueue();
  const currentUserId = workspace.user.id;
  const tasks = workspace.tasks;
  const members = activeHouse?.members ?? [];

  const [activeTab, setActiveTab] = useState<TasksTab>("all");
  const [viewMode, setViewMode] = useState<TasksViewMode>("list");
  const [groupBy, setGroupBy] = useState<GroupByOption>("status");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set()
  );
  const [activePriorities, setActivePriorities] = useState<Set<TaskPriority>>(
    () => new Set(PRIORITY_ORDER)
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<TaskStatus>>(
    () => new Set(STATUS_ORDER)
  );
  const [activeTypes, setActiveTypes] = useState<Set<TaskType>>(
    () => new Set(TASK_TYPES)
  );
  const [activeOwnerTypes, setActiveOwnerTypes] = useState<
    Set<OwnerType | "none">
  >(() => new Set(["project", "client", "none"]));
  const [activeAssigneeIds, setActiveAssigneeIds] = useState<Set<string>>(
    () => new Set(members.map((member) => member.id))
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // "n" opens New Task, unless the user is typing in a field.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (event.key === "n" && !isTyping && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setCreateOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const counts: Record<TasksTab, number> = useMemo(
    () => ({
      all: tasks.length,
      "my-tasks": tasks.filter((task) =>
        task.assignees.some((a) => a.userId === currentUserId)
      ).length,
      "assigned-to-me": tasks.filter(
        (task) =>
          task.assignees.some((a) => a.userId === currentUserId) &&
          task.status !== "completed" &&
          task.status !== "archived"
      ).length,
      completed: tasks.filter((task) => task.status === "completed").length
    }),
    [tasks, currentUserId]
  );

  const tabFiltered = tasks.filter((task) => {
    if (activeTab === "my-tasks") {
      return task.assignees.some((a) => a.userId === currentUserId);
    }
    if (activeTab === "assigned-to-me") {
      return (
        task.assignees.some((a) => a.userId === currentUserId) &&
        task.status !== "completed" &&
        task.status !== "archived"
      );
    }
    if (activeTab === "completed") {
      return task.status === "completed";
    }
    return true;
  });

  const assigneeFilterActive = activeAssigneeIds.size < members.length;

  const filtered = tabFiltered.filter(
    (task) =>
      activePriorities.has(task.priority) &&
      activeStatuses.has(task.status) &&
      activeTypes.has(task.type) &&
      activeOwnerTypes.has(task.ownerType ?? "none") &&
      (!assigneeFilterActive ||
        task.assignees.some((a) => activeAssigneeIds.has(a.userId)))
  );

  const groups = buildGroups(filtered, groupBy);

  function toggleGroupCollapse(key: string) {
    setCollapsedGroups((current) => toggleInSet(current, key));
  }

  function toggleSelect(taskId: string) {
    setSelectedIds((current) => toggleInSet(current, taskId));
  }

  function toggleSelectAll() {
    setSelectedIds((current) =>
      current.size === filtered.length
        ? new Set()
        : new Set(filtered.map((task) => task.id))
    );
  }

  async function toggleComplete(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    try {
      await updateTaskApi(taskId, {
        status: task.status === "completed" ? "todo" : "completed"
      });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update the task."
      );
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) {
      return;
    }

    try {
      await updateTaskApi(taskId, { status });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update the task."
      );
    }
  }

  async function handleDuplicate(taskId: string) {
    try {
      await duplicateTaskRequest(taskId);
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not duplicate the task."
      );
    }
  }

  async function handleSaveAsTemplate(taskId: string) {
    try {
      await saveTaskAsTemplate(taskId);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not save this task as a template."
      );
    }
  }

  async function handleUseTemplate(templateId: string) {
    try {
      await createTaskFromTemplate(templateId);
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not create a task from this template."
      );
    }
  }

  // Lets a manager attach footage to a Shoot task straight from the
  // Completed list, without opening the detail panel - the shoot may
  // have been marked complete before its footage was actually uploaded.
  // Mirrors ShootTaskCard's own upload flow (finish-and-upload, enqueue,
  // mark uploaded), but checks the shoot's current status first since
  // this entry point doesn't have it preloaded.
  function handleUploadShootData(task: ProductionTask) {
    const shootId = task.shootId;
    if (!shootId) return;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      if (files.length === 0) return;

      void (async () => {
        try {
          const shoot = await getShoot(shootId);
          const notYetUploading = [
            "scheduled",
            "crew-reached",
            "started",
            "finished"
          ].includes(shoot.status);
          if (notYetUploading) {
            await finishAndUploadShoot(shootId);
          }

          const { parentId } = await getShootUploadFolder(shootId);
          let remaining = files.length;
          for (const file of files) {
            enqueue(
              file,
              { parentId, label: `Shoot footage — ${task.title}` },
              () => {
                remaining -= 1;
                if (remaining === 0) {
                  void (async () => {
                    const latest = await getShoot(shootId);
                    if (latest.status === "uploading" || notYetUploading) {
                      await markShootUploaded(shootId);
                    }
                    await refreshWorkspace();
                  })();
                }
              }
            );
          }
        } catch (error) {
          window.alert(
            error instanceof Error
              ? error.message
              : "Could not upload the shoot data."
          );
        }
      })();
    };
    input.click();
  }

  async function handleDelete(taskId: string) {
    try {
      await deleteTaskApi(taskId);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(taskId);
        return next;
      });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete the task."
      );
    }
  }

  async function bulkUpdateStatus(status: TaskStatus) {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => updateTaskApi(id, { status }))
      );
      setSelectedIds(new Set());
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update tasks."
      );
    }
  }

  async function bulkUpdatePriority(priority: TaskPriority) {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => updateTaskApi(id, { priority }))
      );
      setSelectedIds(new Set());
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update tasks."
      );
    }
  }

  async function bulkDelete() {
    if (!window.confirm(`Delete ${selectedIds.size} task(s)?`)) {
      return;
    }
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteTaskApi(id)));
      setSelectedIds(new Set());
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete tasks."
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8 xl:grid-cols-[1fr_20rem]">
      <div className="grid min-w-0 grid-cols-1 gap-4">
        <TasksHeader />
        <TasksToolbar
          activeAssigneeIds={activeAssigneeIds}
          activePriorities={activePriorities}
          activeStatuses={activeStatuses}
          activeTab={activeTab}
          activeTypes={activeTypes}
          counts={counts}
          groupBy={groupBy}
          members={members}
          onGroupByChange={setGroupBy}
          onNewTask={() => setCreateOpen(true)}
          onTabChange={setActiveTab}
          onToggleAssignee={(userId) =>
            setActiveAssigneeIds((current) => toggleInSet(current, userId))
          }
          onTogglePriority={(priority) =>
            setActivePriorities((current) => toggleInSet(current, priority))
          }
          onToggleStatus={(status) =>
            setActiveStatuses((current) => toggleInSet(current, status))
          }
          onToggleType={(type) =>
            setActiveTypes((current) => toggleInSet(current, type))
          }
          activeOwnerTypes={activeOwnerTypes}
          onToggleOwnerType={(value) =>
            setActiveOwnerTypes((current) => toggleInSet(current, value))
          }
          onViewModeChange={setViewMode}
          viewMode={viewMode}
        />

        {activeHouse ? (
          <TaskTemplatesPopover
            houseId={activeHouse.id}
            onUseTemplate={handleUseTemplate}
          />
        ) : null}

        {selectedIds.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#654cff]/20 bg-[#654cff]/5 px-4 py-2.5">
            <span className="text-sm font-bold text-[#654cff]">
              {selectedIds.size} selected
            </span>
            <Select
              onValueChange={(next) =>
                void bulkUpdateStatus(next as TaskStatus)
              }
              value=""
            >
              <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
                <SelectValue placeholder="Set status..." />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_META[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(next) =>
                void bulkUpdatePriority(next as TaskPriority)
              }
              value=""
            >
              <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
                <SelectValue placeholder="Set priority..." />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_ORDER.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {PRIORITY_META[priority].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              className="text-xs font-bold text-red-600"
              onClick={() => void bulkDelete()}
              type="button"
            >
              Delete
            </button>
            <button
              className="ml-auto text-xs font-bold text-[#8a90a3]"
              onClick={() => setSelectedIds(new Set())}
              type="button"
            >
              Clear
            </button>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <TasksEmptyState />
        ) : viewMode === "board" ? (
          <TaskKanbanBoard
            onOpenTask={setSelectedTaskId}
            onStatusChange={handleStatusChange}
            tasks={filtered}
          />
        ) : viewMode === "table" ? (
          <TaskTableView
            onOpen={setSelectedTaskId}
            onToggleSelect={toggleSelect}
            selectedIds={selectedIds}
            tasks={filtered}
          />
        ) : (
          <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            <div className="min-w-[42rem]">
              <TaskListColumnHeader
                allSelected={
                  filtered.length > 0 && selectedIds.size === filtered.length
                }
                onToggleSelectAll={toggleSelectAll}
              />
              {groups.map((group) => {
                const collapsed = collapsedGroups.has(group.key);

                return (
                  <div key={group.key}>
                    <TaskGroupHeader
                      collapsed={collapsed}
                      count={group.tasks.length}
                      dotClassName={group.dotClassName}
                      label={group.label}
                      onAddTask={() => setCreateOpen(true)}
                      onToggle={() => toggleGroupCollapse(group.key)}
                    />
                    {!collapsed
                      ? group.tasks.map((task) => (
                          <TaskRowItem
                            key={task.id}
                            onDelete={() => handleDelete(task.id)}
                            onDuplicate={() => handleDuplicate(task.id)}
                            onOpen={() => setSelectedTaskId(task.id)}
                            onSaveAsTemplate={() =>
                              handleSaveAsTemplate(task.id)
                            }
                            onToggleComplete={() => toggleComplete(task.id)}
                            onToggleSelect={() => toggleSelect(task.id)}
                            onUploadShootData={() =>
                              handleUploadShootData(task)
                            }
                            selected={selectedIds.has(task.id)}
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

      <aside className="grid min-w-0 grid-cols-1 content-start gap-6">
        <TaskOverviewPanel tasks={tasks} />
        <TaskPriorityPanel tasks={tasks} />
        <UpcomingDeadlinesPanel tasks={tasks} />
        <MyTasksStatPanel
          completed={
            tasks.filter(
              (task) =>
                task.assignees.some((a) => a.userId === currentUserId) &&
                task.status === "completed"
            ).length
          }
          onViewAll={() => setActiveTab("my-tasks")}
          pending={
            tasks.filter(
              (task) =>
                task.assignees.some((a) => a.userId === currentUserId) &&
                task.status !== "completed" &&
                task.status !== "archived"
            ).length
          }
        />
      </aside>

      <TaskCreateDialog
        members={members}
        onCreate={async (request) => {
          const created = await createTaskApi(request);
          await refreshWorkspace();
          return created;
        }}
        onOpenChange={setCreateOpen}
        onShootCreated={() => void refreshWorkspace()}
        open={createOpen}
        tasks={tasks}
      />

      {selectedTaskId ? (
        <TaskDetailPanel
          currentUserId={currentUserId}
          members={members}
          onChanged={() => void refreshWorkspace()}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTaskId(null);
            }
          }}
          taskId={selectedTaskId}
          tasks={tasks}
        />
      ) : null}
    </div>
  );
}
