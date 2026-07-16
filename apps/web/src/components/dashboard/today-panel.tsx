"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { PRIORITY_META } from "@/components/tasks/task-data";
import { toISODate } from "@/lib/calendar-utils";
import { useWorkspace } from "@/lib/workspace-context";
import { listCalendarEvents } from "@/services/base-workspace.service";
import type {
  CalendarEvent,
  CalendarEventCategory,
  ProductionTask
} from "@/types/base";

const CATEGORY_DOT: Record<CalendarEventCategory, string> = {
  shoot: "bg-[#654cff]",
  "post-production": "bg-[#dc2626]",
  meeting: "bg-[#3b82f6]",
  "pre-production": "bg-[#a8560f]",
  delivery: "bg-[#16c784]",
  other: "bg-[#8a90a3]"
};

function formatCountdown(dueDate: string): { label: string; overdue: boolean } {
  const diffMs = new Date(dueDate).getTime() - Date.now();
  if (diffMs < 0) {
    return { label: "Overdue", overdue: true };
  }

  const diffHours = diffMs / (60 * 60 * 1000);
  if (diffHours < 24) {
    return {
      label: `${Math.max(1, Math.round(diffHours))}h left`,
      overdue: false
    };
  }

  return { label: `${Math.round(diffHours / 24)}d left`, overdue: false };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
      {children}
    </span>
  );
}

export function TodayPanel({ excludeTaskId }: { excludeTaskId?: string }) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    const today = toISODate(new Date());

    listCalendarEvents()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setEvents(
          data
            .filter((event) => event.date === today)
            .sort((a, b) => a.time.localeCompare(b.time))
        );
      })
      .catch(() => {
        // Fails quietly - the Calendar page surfaces the error.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const deadlines: ProductionTask[] = workspace.tasks
    .filter(
      (task) =>
        task.id !== excludeTaskId &&
        task.dueDate !== null &&
        task.status !== "completed" &&
        task.status !== "archived" &&
        task.assignees.some((assignee) => assignee.userId === workspace.user.id)
    )
    .sort((a, b) => (a.dueDate as string).localeCompare(b.dueDate as string))
    .slice(0, 3);

  return (
    <DashboardPanel
      action={{
        label: "View Calendar",
        onClick: () => router.push("/calendar")
      }}
      title="Today"
    >
      <div className="grid gap-2 p-4">
        <SectionLabel>Schedule</SectionLabel>
        {events.length > 0 ? (
          <div className="grid gap-2.5">
            {events.map((event) => (
              <div className="flex items-start gap-2.5" key={event.id}>
                <time className="w-14 shrink-0 text-xs font-bold text-[#4b5268] dark:text-[#c7cad9]">
                  {event.time}
                </time>
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${CATEGORY_DOT[event.category]}`}
                />
                <strong className="min-w-0 flex-1 truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {event.title}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
            Nothing scheduled today.
          </p>
        )}
      </div>

      <div className="grid gap-2 border-t border-black/5 p-4 dark:border-white/[0.06]">
        <SectionLabel>Deadlines</SectionLabel>
        {deadlines.length > 0 ? (
          <div className="grid gap-2">
            {deadlines.map((task) => {
              const countdown = formatCountdown(task.dueDate as string);
              return (
                <div className="flex items-center gap-2.5" key={task.id}>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_META[task.priority].dot}`}
                  />
                  <strong className="min-w-0 flex-1 truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {task.title}
                  </strong>
                  <span
                    className={`text-xs font-bold ${countdown.overdue ? "text-red-600" : "text-[#8a90a3] dark:text-[#7d8299]"}`}
                  >
                    {countdown.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
            No upcoming deadlines.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
