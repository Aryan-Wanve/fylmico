"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { toISODate } from "@/lib/calendar-utils";
import { listCalendarEvents } from "@/services/base-workspace.service";
import type { CalendarEvent, CalendarEventCategory } from "@/types/base";

const CATEGORY_DOT: Record<CalendarEventCategory, string> = {
  shoot: "bg-[#654cff]",
  "post-production": "bg-[#dc2626]",
  meeting: "bg-[#3b82f6]",
  "pre-production": "bg-[#a8560f]",
  delivery: "bg-[#16c784]",
  other: "bg-[#8a90a3]"
};

export function TodayTimelinePanel() {
  const router = useRouter();
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

  return (
    <DashboardPanel
      action={{
        label: "View Calendar",
        onClick: () => router.push("/calendar")
      }}
      title="Today's Schedule"
    >
      <div className="grid gap-3 p-5">
        {events.length > 0 ? (
          events.map((event) => (
            <div className="flex items-start gap-3" key={event.id}>
              <time className="w-16 shrink-0 text-xs font-bold text-[#4b5268] dark:text-[#c7cad9]">
                {event.time}
              </time>
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${CATEGORY_DOT[event.category]}`}
              />
              <div className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {event.title}
                </strong>
                {event.location ? (
                  <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                    {event.location}
                  </span>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
            Nothing scheduled today.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
