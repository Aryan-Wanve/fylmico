"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { listCalendarEvents } from "@/services/base-workspace.service";
import { toISODate } from "@/lib/calendar-utils";
import type { CalendarEvent, CalendarEventCategory } from "@/types/base";

const CATEGORY_DOT: Record<CalendarEventCategory, string> = {
  shoot: "bg-[#654cff]",
  "post-production": "bg-[#dc2626]",
  meeting: "bg-[#3b82f6]",
  "pre-production": "bg-[#a8560f]",
  delivery: "bg-[#16c784]",
  other: "bg-[#8a90a3]"
};

export function UpcomingSchedulePanel() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listCalendarEvents()
      .then((data) => {
        if (cancelled) {
          return;
        }

        const today = toISODate(new Date());
        const upcoming = data
          .filter((event) => event.date >= today)
          .sort((a, b) =>
            a.date === b.date
              ? a.time.localeCompare(b.time)
              : a.date.localeCompare(b.date)
          )
          .slice(0, 5);

        setEvents(upcoming);
      })
      .catch(() => {
        // Dashboard panel fails quietly - the Calendar page surfaces the error.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selected = events[selectedIndex];

  return (
    <DashboardPanel
      action={{
        label: "View Calendar",
        onClick: () => router.push("/calendar")
      }}
      title="Upcoming Schedule"
    >
      <div className="grid">
        {events.length > 0 ? (
          events.map((event, index) => (
            <button
              className={`grid grid-cols-[5rem_auto_1fr_auto] items-center gap-4 border-b border-black/5 px-6 py-3.5 text-left last:border-b-0 hover:bg-black/[0.02] dark:border-white/[0.06] dark:hover:bg-white/[0.04] ${
                index === selectedIndex ? "bg-[#654cff]/[0.04]" : ""
              }`}
              key={event.id}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <time className="text-sm font-semibold text-[#4b5268] dark:text-[#c7cad9]">
                {event.time}
              </time>
              <span
                className={`h-2.5 w-2.5 rounded-full ${CATEGORY_DOT[event.category]}`}
              />
              <div className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {event.title}
                </strong>
                <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  {event.date}
                </span>
              </div>
              <span className="text-xs font-medium text-[#8a90a3] dark:text-[#7d8299]">
                {event.location ?? ""}
              </span>
            </button>
          ))
        ) : (
          <p className="px-6 py-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
            Nothing scheduled yet.
          </p>
        )}
      </div>
      {selected ? (
        <div className="m-4 rounded-xl bg-[#654cff]/[0.06] p-3.5">
          <strong className="block text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {selected.title}
          </strong>
          <span className="text-xs font-medium text-[#5f667d] dark:text-[#a8acbf]">
            {selected.time} at {selected.location ?? "TBD"}
          </span>
        </div>
      ) : null}
    </DashboardPanel>
  );
}
