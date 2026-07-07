export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "on-hold" | "done";

export type Task = {
  id: string;
  title: string;
  project: string;
  assigneeId: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  commentCount?: number;
  attachmentCount?: number;
};

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

export const MEMBER_NAMES: Record<string, string> = {
  "user-aryan": "Aryan Wanve",
  "user-priya": "Priya Shah",
  "user-rahul": "Rahul Mehta",
  "user-ananya": "Ananya Rao",
  "user-karan": "Karan Gill"
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

function isoOffset(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const tasks: Task[] = [
  {
    id: "task-1",
    title: "Review storyboard v2",
    project: "Beyond Frames",
    assigneeId: "user-priya",
    dueDate: isoOffset(0),
    priority: "high",
    status: "todo",
    commentCount: 2,
    attachmentCount: 3
  },
  {
    id: "task-2",
    title: "Finalize shot list",
    project: "Lumee Ad Campaign",
    assigneeId: "user-rahul",
    dueDate: isoOffset(1),
    priority: "medium",
    status: "todo"
  },
  {
    id: "task-3",
    title: "Location permissions",
    project: "Wanderers",
    assigneeId: "user-karan",
    dueDate: isoOffset(5),
    priority: "low",
    status: "todo"
  },
  {
    id: "task-4",
    title: "Book camera & lighting",
    project: "Beyond Frames",
    assigneeId: "user-ananya",
    dueDate: isoOffset(10),
    priority: "medium",
    status: "todo",
    attachmentCount: 1
  },
  {
    id: "task-5",
    title: "Scout additional locations",
    project: "City Lights",
    assigneeId: "user-rahul",
    dueDate: isoOffset(6),
    priority: "low",
    status: "todo"
  },
  {
    id: "task-6",
    title: "Draft call sheet",
    project: "Silver Linings",
    assigneeId: "user-priya",
    dueDate: isoOffset(12),
    priority: "low",
    status: "todo"
  },
  {
    id: "task-7",
    title: "Confirm cast availability",
    project: "The Long Way Home",
    assigneeId: "user-karan",
    dueDate: isoOffset(-2),
    priority: "high",
    status: "todo"
  },
  {
    id: "task-8",
    title: "Prep equipment list",
    project: "Afterglow",
    assigneeId: "user-aryan",
    dueDate: isoOffset(4),
    priority: "medium",
    status: "todo"
  },
  {
    id: "task-9",
    title: "Write shot descriptions",
    project: "Studio Sessions",
    assigneeId: "user-ananya",
    dueDate: isoOffset(8),
    priority: "low",
    status: "todo"
  },
  {
    id: "task-10",
    title: "Edit rough cut",
    project: "Echoes",
    assigneeId: "user-rahul",
    dueDate: isoOffset(0),
    priority: "medium",
    status: "in-progress"
  },
  {
    id: "task-11",
    title: "Sound design draft",
    project: "Lumee Ad Campaign",
    assigneeId: "user-karan",
    dueDate: isoOffset(1),
    priority: "high",
    status: "in-progress",
    attachmentCount: 1
  },
  {
    id: "task-12",
    title: "Color grading test",
    project: "Beyond Frames",
    assigneeId: "user-priya",
    dueDate: isoOffset(2),
    priority: "low",
    status: "in-progress",
    commentCount: 1,
    attachmentCount: 2
  },
  {
    id: "task-13",
    title: "Create animatic",
    project: "Wanderers",
    assigneeId: "user-ananya",
    dueDate: isoOffset(3),
    priority: "medium",
    status: "in-progress"
  },
  {
    id: "task-14",
    title: "Voiceover recording",
    project: "Studio Sessions",
    assigneeId: "user-aryan",
    dueDate: isoOffset(5),
    priority: "medium",
    status: "in-progress"
  },
  {
    id: "task-15",
    title: "Rough mix pass",
    project: "Neon Nights",
    assigneeId: "user-rahul",
    dueDate: isoOffset(-1),
    priority: "high",
    status: "in-progress"
  },
  {
    id: "task-16",
    title: "Storyboard revisions",
    project: "Silver Linings",
    assigneeId: "user-priya",
    dueDate: isoOffset(6),
    priority: "low",
    status: "in-progress"
  },
  {
    id: "task-17",
    title: "Venue confirmation",
    project: "Forever & Always",
    assigneeId: "user-karan",
    dueDate: isoOffset(20),
    priority: "low",
    status: "on-hold"
  },
  {
    id: "task-18",
    title: "Client sign-off",
    project: "City Lights",
    assigneeId: "user-aryan",
    dueDate: isoOffset(15),
    priority: "medium",
    status: "on-hold"
  },
  {
    id: "task-19",
    title: "Client brief call",
    project: "Beyond Frames",
    assigneeId: "user-karan",
    dueDate: isoOffset(-10),
    priority: "low",
    status: "done"
  },
  {
    id: "task-20",
    title: "Script lock",
    project: "Lumee Ad Campaign",
    assigneeId: "user-priya",
    dueDate: isoOffset(-8),
    priority: "medium",
    status: "done"
  },
  {
    id: "task-21",
    title: "Casting shortlist",
    project: "Silver Linings",
    assigneeId: "user-ananya",
    dueDate: isoOffset(-14),
    priority: "medium",
    status: "done"
  },
  {
    id: "task-22",
    title: "Storyboard v1",
    project: "Beyond Frames",
    assigneeId: "user-priya",
    dueDate: isoOffset(-20),
    priority: "low",
    status: "done"
  },
  {
    id: "task-23",
    title: "Location scout report",
    project: "Wanderers",
    assigneeId: "user-karan",
    dueDate: isoOffset(-12),
    priority: "low",
    status: "done"
  },
  {
    id: "task-24",
    title: "Rough cut review",
    project: "Roots",
    assigneeId: "user-rahul",
    dueDate: isoOffset(-6),
    priority: "medium",
    status: "done"
  }
];
