import type {
  CalendarEvent as ApiCalendarEvent,
  ProductionTask,
  Project
} from "@/types/base";

export type EventCategory =
  | "shoot"
  | "post-production"
  | "meeting"
  | "pre-production"
  | "delivery"
  | "other";

export const CATEGORY_ORDER: EventCategory[] = [
  "shoot",
  "post-production",
  "meeting",
  "pre-production",
  "delivery",
  "other"
];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  shoot: "Shoot",
  "post-production": "Post-Production",
  meeting: "Meeting",
  "pre-production": "Pre-Production",
  delivery: "Delivery",
  other: "Other"
};

export const CATEGORY_STYLES: Record<
  EventCategory,
  { dot: string; chip: string }
> = {
  shoot: { dot: "bg-[#654cff]", chip: "bg-[#654cff]/10 text-[#4c3bd6]" },
  "post-production": {
    dot: "bg-[#16c784]",
    chip: "bg-[#16c784]/10 text-[#0f9d68]"
  },
  meeting: { dot: "bg-[#f97316]", chip: "bg-[#f97316]/10 text-[#c2570d]" },
  "pre-production": {
    dot: "bg-[#3b82f6]",
    chip: "bg-[#3b82f6]/10 text-[#1d4ed8]"
  },
  delivery: { dot: "bg-[#ef4444]", chip: "bg-[#ef4444]/10 text-[#b91c1c]" },
  other: {
    dot: "bg-[#8a90a3]",
    chip: "bg-[#8a90a3]/10 text-[#5f667d] dark:text-[#a8acbf]"
  }
};

export const MY_SCHEDULE_ID = "my-schedule";
export const TASK_DEADLINES_ID = "task-deadlines";

export type CalendarSource = {
  id: string;
  name: string;
  color: string;
};

const SOURCE_COLORS = [
  "bg-[#3b82f6]",
  "bg-[#f97316]",
  "bg-[#16c784]",
  "bg-[#ef4444]",
  "bg-violet-600",
  "bg-pink-600",
  "bg-emerald-600",
  "bg-slate-700"
];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function buildCalendarSources(projects: Project[]): CalendarSource[] {
  return [
    { id: MY_SCHEDULE_ID, name: "My Schedule", color: "bg-[#654cff]" },
    { id: TASK_DEADLINES_ID, name: "Task Deadlines", color: "bg-[#ef4444]" },
    ...projects.map((project) => ({
      id: project.id,
      name: project.title,
      color: SOURCE_COLORS[hashString(project.id) % SOURCE_COLORS.length]
    }))
  ];
}

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  category: EventCategory;
  calendarId: string;
};

export function toCalendarEvent(event: ApiCalendarEvent): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location ?? undefined,
    category: event.category,
    calendarId: event.projectId ?? MY_SCHEDULE_ID
  };
}

export function toTaskCalendarEvent(task: ProductionTask): CalendarEvent {
  const due = new Date(task.dueDate as string);
  return {
    id: `task-${task.id}`,
    title: task.title,
    date: due.toISOString().slice(0, 10),
    time: due.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }),
    category: "other",
    calendarId: TASK_DEADLINES_ID
  };
}
