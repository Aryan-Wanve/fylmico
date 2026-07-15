"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import {
  PRIORITY_META,
  STATUS_META,
  STATUS_ORDER,
  formatDueDate,
  toInitials
} from "@/components/tasks/task-data";
import { TaskIndicatorBadges } from "@/components/tasks/task-indicator-badges";
import type { ProductionTask, TaskStatus } from "@/types/base";

function TaskKanbanCard({
  task,
  onDragStart,
  onOpen
}: {
  task: ProductionTask;
  onDragStart: (event: React.DragEvent, taskId: string) => void;
  onOpen: () => void;
}) {
  const due = formatDueDate(task.dueDate);
  const priority = PRIORITY_META[task.priority];

  return (
    <button
      className="grid cursor-grab gap-2 rounded-xl border border-black/[0.06] bg-white p-3 text-left shadow-[0_0.5rem_1.5rem_rgba(53,45,124,0.05)] active:cursor-grabbing dark:border-white/[0.08] dark:bg-[#171a28]"
      draggable
      onClick={onOpen}
      onDragStart={(event) => onDragStart(event, task.id)}
      type="button"
    >
      <strong className="text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
        {task.title}
      </strong>
      <TaskIndicatorBadges task={task} />
      <div className="flex items-center justify-between">
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-bold ${priority.badge}`}
        >
          {priority.label}
        </span>
        <span
          className={`text-xs font-semibold ${
            due.overdue && task.status !== "completed"
              ? "text-red-600"
              : "text-[#8a90a3] dark:text-[#7d8299]"
          }`}
        >
          {due.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center -space-x-2">
          {task.assignees.length === 0 ? (
            <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
              Unassigned
            </span>
          ) : (
            task.assignees
              .slice(0, 3)
              .map((assignee) => (
                <AvatarWithStatus
                  key={assignee.userId}
                  label={toInitials(assignee.name)}
                  size="sm"
                  userId={assignee.userId}
                />
              ))
          )}
        </div>
        {task.commentCount ? (
          <span className="flex items-center gap-1 text-xs text-[#8a90a3] dark:text-[#7d8299]">
            <MessageSquare className="h-3 w-3" />
            {task.commentCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function TaskKanbanBoard({
  tasks,
  onStatusChange,
  onOpenTask
}: {
  tasks: ProductionTask[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onOpenTask: (taskId: string) => void;
}) {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  function handleDragStart(event: React.DragEvent, taskId: string) {
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(event: React.DragEvent, status: TaskStatus) {
    event.preventDefault();
    setDragOverColumn(null);
    const taskId = event.dataTransfer.getData("text/plain");
    if (taskId) {
      onStatusChange(taskId, status);
    }
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <div
            className={`grid min-w-0 content-start gap-3 rounded-2xl border p-3 transition-colors ${
              dragOverColumn === status
                ? "border-[#654cff] bg-[#654cff]/5"
                : "border-black/[0.06] bg-[#fafafd] dark:border-white/[0.08] dark:bg-[#11142c]"
            }`}
            key={status}
            onDragLeave={() => setDragOverColumn(null)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverColumn(status);
            }}
            onDrop={(event) => handleDrop(event, status)}
          >
            <div className="flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {meta.label}
              </strong>
              <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-xs font-bold text-[#5f667d] dark:bg-white/[0.08] dark:text-[#a8acbf]">
                {columnTasks.length}
              </span>
            </div>

            <div className="grid min-h-16 gap-2">
              {columnTasks.map((task) => (
                <TaskKanbanCard
                  key={task.id}
                  onDragStart={handleDragStart}
                  onOpen={() => onOpenTask(task.id)}
                  task={task}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
