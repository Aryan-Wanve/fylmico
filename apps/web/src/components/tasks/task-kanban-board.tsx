"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import {
  PRIORITY_META,
  STATUS_META,
  STATUS_ORDER,
  formatDueDate,
  toInitials,
  type Task,
  type TaskStatus
} from "@/components/tasks/task-data";

function TaskKanbanCard({
  task,
  onDragStart
}: {
  task: Task;
  onDragStart: (event: React.DragEvent, taskId: string) => void;
}) {
  const due = formatDueDate(task.dueDate);
  const priority = PRIORITY_META[task.priority];

  return (
    <div
      className="grid cursor-grab gap-2 rounded-xl border border-black/[0.06] bg-white p-3 shadow-[0_0.5rem_1.5rem_rgba(53,45,124,0.05)] active:cursor-grabbing dark:border-white/[0.08] dark:bg-[#171a28]"
      draggable
      onDragStart={(event) => onDragStart(event, task.id)}
    >
      <strong className="text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
        {task.title}
      </strong>
      <div className="flex items-center justify-between">
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-bold ${priority.badge}`}
        >
          {priority.label}
        </span>
        <span
          className={`text-xs font-semibold ${
            due.overdue && task.status !== "done"
              ? "text-red-600"
              : "text-[#8a90a3] dark:text-[#7d8299]"
          }`}
        >
          {due.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <AvatarWithStatus
            label={toInitials(task.assigneeName)}
            size="sm"
            userId={task.assigneeId}
          />
          <span className="truncate text-xs text-[#4b5268] dark:text-[#c7cad9]">
            {task.assigneeName.split(" ")[0]}
          </span>
        </div>
        {task.commentCount ? (
          <span className="flex items-center gap-1 text-xs text-[#8a90a3] dark:text-[#7d8299]">
            <MessageSquare className="h-3 w-3" />
            {task.commentCount}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function TaskKanbanBoard({
  tasks,
  onStatusChange
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
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
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
