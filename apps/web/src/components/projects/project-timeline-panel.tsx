"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  listCalendarEvents,
  listProjects
} from "@/services/base-workspace.service";
import { isSameDay, toISODate } from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/types/base";

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function ProjectTimelinePanel() {
  const router = useRouter();
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projectTitles, setProjectTitles] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    let cancelled = false;

    listCalendarEvents()
      .then((data) => {
        if (!cancelled) {
          setEvents(data);
        }
      })
      .catch(() => {
        // Panel fails quietly - the Calendar page surfaces the error.
      });

    listProjects()
      .then((data) => {
        if (!cancelled) {
          setProjectTitles(
            Object.fromEntries(
              data.map((project) => [project.id, project.title])
            )
          );
        }
      })
      .catch(() => {
        // Project names are a nice-to-have here; ignore fetch failures.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  const monthLabel = weekStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  const dayEvents = events
    .filter((event) => event.date === toISODate(selectedDate))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <DashboardPanel
      action={{
        label: "View Calendar",
        onClick: () => router.push("/calendar")
      }}
      className="min-w-0"
      title="Project Timeline"
    >
      <div className="p-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <strong className="text-sm font-bold text-[#11142c]">
            {monthLabel}
          </strong>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous week"
              className="grid h-7 w-7 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04]"
              onClick={() =>
                setWeekStart((current) => {
                  const next = new Date(current);
                  next.setDate(next.getDate() - 7);
                  return next;
                })
              }
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next week"
              className="grid h-7 w-7 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04]"
              onClick={() =>
                setWeekStart((current) => {
                  const next = new Date(current);
                  next.setDate(next.getDate() + 7);
                  return next;
                })
              }
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, index) => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                className="grid gap-1.5 text-center"
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                type="button"
              >
                <span className="text-[0.65rem] font-bold text-[#c3c7d4]">
                  {WEEKDAY_LABELS[index]}
                </span>
                <span
                  className={`grid h-9 place-items-center rounded-xl text-sm font-bold ${
                    isSelected
                      ? "bg-[#654cff] text-white"
                      : isToday
                        ? "bg-[#654cff]/10 text-[#654cff]"
                        : "text-[#4b5268] hover:bg-black/[0.04]"
                  }`}
                >
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-black/5">
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <div className="flex items-center gap-4 px-6 py-3.5" key={event.id}>
              <time className="w-20 shrink-0 text-sm font-semibold text-[#4b5268]">
                {event.time}
              </time>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-[#11142c]">
                  {event.title}
                </strong>
                <span className="text-xs text-[#8a90a3]">
                  {event.location ?? "TBD"}
                  {event.projectId && projectTitles[event.projectId]
                    ? ` • ${projectTitles[event.projectId]}`
                    : ""}
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-[#654cff]/10 px-2 py-0.5 text-xs font-bold text-[#654cff]">
                {event.category}
              </span>
            </div>
          ))
        ) : (
          <p className="px-6 py-6 text-center text-sm text-[#8a90a3]">
            No shoots scheduled for this day.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
