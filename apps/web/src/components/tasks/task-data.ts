import type {
  ProductionTask,
  TaskPriority,
  TaskStatus,
  TaskType
} from "@/types/base";

export type { TaskStatus, TaskPriority, TaskType };
export type Task = ProductionTask;

export const STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in-progress",
  "review",
  "changes-requested",
  "completed",
  "archived"
];

export const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  todo: { label: "To Do", dot: "bg-[#94a3b8]" },
  "in-progress": { label: "In Progress", dot: "bg-[#3b82f6]" },
  review: { label: "Review", dot: "bg-[#a855f7]" },
  "changes-requested": { label: "Changes Requested", dot: "bg-[#f59e0b]" },
  completed: { label: "Completed", dot: "bg-[#16c784]" },
  archived: { label: "Archived", dot: "bg-[#64748b]" }
};

export const STATUS_COLOR_HEX: Record<TaskStatus, string> = {
  todo: "#94a3b8",
  "in-progress": "#3b82f6",
  review: "#a855f7",
  "changes-requested": "#f59e0b",
  completed: "#16c784",
  archived: "#64748b"
};

export const PRIORITY_ORDER: TaskPriority[] = [
  "urgent",
  "high",
  "medium",
  "low"
];

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badge: string; bar: string; dot: string }
> = {
  urgent: {
    label: "Urgent",
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-600",
    dot: "bg-red-600"
  },
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

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  shoot: "Shoot",
  edit: "Edit",
  "color-grade": "Color Grade",
  "sound-design": "Sound Design",
  vfx: "VFX",
  "motion-graphics": "Motion Graphics",
  storyboarding: "Storyboarding",
  "script-writing": "Script Writing",
  thumbnail: "Thumbnail",
  photography: "Photography",
  reels: "Reels",
  "social-media": "Social Media",
  "client-review": "Client Review",
  delivery: "Delivery",
  "asset-collection": "Asset Collection",
  equipment: "Equipment",
  "location-scouting": "Location Scouting",
  casting: "Casting",
  meeting: "Meeting",
  admin: "Admin",
  custom: "Custom"
};

export const TASK_TYPES = Object.keys(TASK_TYPE_LABELS) as TaskType[];

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

export function getProjectColor(project: string | null) {
  const key = project ?? "No Project";
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0;
  }

  return PROJECT_COLOR_PALETTE[Math.abs(hash) % PROJECT_COLOR_PALETTE.length];
}

export function formatDueDate(iso: string | null): {
  label: string;
  overdue: boolean;
} {
  if (!iso) {
    return { label: "No due date", overdue: false };
  }

  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (dueDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
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

// Bold/italic/bullet-list/link markdown-lite renderer for task descriptions -
// same insert-at-cursor-syntax approach as Scripts' formatting toolbar, but
// rendered rather than left as raw screenplay text. No editor library.
export function renderMarkdownLite(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withInline = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline">$1</a>'
    );

  const lines = withInline.split("\n");
  const html: string[] = [];
  let inList = false;
  for (const line of lines) {
    if (line.trim().startsWith("- ")) {
      if (!inList) {
        html.push("<ul class='list-disc pl-5'>");
        inList = true;
      }
      html.push(`<li>${line.trim().slice(2)}</li>`);
    } else {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(line.length ? `<p>${line}</p>` : "<br/>");
    }
  }
  if (inList) {
    html.push("</ul>");
  }
  return html.join("");
}
