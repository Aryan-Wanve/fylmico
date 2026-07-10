import type { ProductionTask, TaskStatus } from "@/types/base";

export type TaskPriority = "high" | "medium" | "low";
export type { TaskStatus };
export type Task = ProductionTask;

export const STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in-progress",
  "on-hold",
  "done"
];

export const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  todo: { label: "To Do", dot: "bg-[#94a3b8]" },
  "in-progress": { label: "In Progress", dot: "bg-[#3b82f6]" },
  "on-hold": { label: "On Hold", dot: "bg-[#f59e0b]" },
  done: { label: "Completed", dot: "bg-[#16c784]" }
};

export const STATUS_COLOR_HEX: Record<TaskStatus, string> = {
  todo: "#94a3b8",
  "in-progress": "#3b82f6",
  "on-hold": "#f59e0b",
  done: "#16c784"
};

export const PRIORITY_ORDER: TaskPriority[] = ["high", "medium", "low"];

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badge: string; bar: string; dot: string }
> = {
  high: {
    label: "High",
    badge: "bg-red-50 text-red-600",
    bar: "bg-red-500",
    dot: "bg-red-500"
  },
  medium: {
    label: "Medium",
    badge: "bg-orange-50 text-orange-600",
    bar: "bg-orange-400",
    dot: "bg-orange-400"
  },
  low: {
    label: "Low",
    badge: "bg-blue-50 text-blue-600",
    bar: "bg-blue-400",
    dot: "bg-blue-400"
  }
};

const PROJECT_COLOR_PALETTE = [
  { bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-400" },
  { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
  { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  { bg: "bg-pink-50", text: "text-pink-600", dot: "bg-pink-400" },
  { bg: "bg-cyan-50", text: "text-cyan-600", dot: "bg-cyan-400" }
];

export function toInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase() || "?";
}

export function getProjectColor(project: string) {
  let hash = 0;

  for (let index = 0; index < project.length; index += 1) {
    hash = (hash * 31 + project.charCodeAt(index)) | 0;
  }

  return PROJECT_COLOR_PALETTE[Math.abs(hash) % PROJECT_COLOR_PALETTE.length];
}

export function formatDueDate(iso: string): {
  label: string;
  overdue: boolean;
} {
  const due = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (diffDays === 0) {
    return { label: "Today", overdue: false };
  }

  if (diffDays === 1) {
    return { label: "Tomorrow", overdue: false };
  }

  return {
    label: due.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    overdue: diffDays < 0
  };
}
