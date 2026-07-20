import { CalendarEventPill } from "@/components/calendar/calendar-event-pill";
import type { CalendarEvent } from "@/components/calendar/calendar-data";
import {
  getMonthGrid,
  isSameDay,
  isSameMonth,
  toISODate
} from "@/lib/calendar-utils";

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MAX_VISIBLE_EVENTS = 2;

export function CalendarMonthGrid({
  visibleMonth,
  events,
  selectedDate,
  onSelectDate
}: {
  visibleMonth: Date;
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  const weeks = getMonthGrid(visibleMonth);
  const today = new Date();

  const eventsByDate = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const existing = eventsByDate.get(event.date);

    if (existing) {
      existing.push(event);
    } else {
      eventsByDate.set(event.date, [event]);
    }
  }

  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="grid min-w-[42rem] grid-cols-7 border-b border-black/5 dark:border-white/[0.06]">
        {WEEKDAY_LABELS.map((label) => (
          <div
            className="px-3 py-3 text-center text-xs font-bold tracking-wide text-[#8a90a3] dark:text-[#7d8299]"
            key={label}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-w-[42rem] grid-cols-7">
        {weeks.map((week) =>
          week.map((day) => {
            const dayEvents = eventsByDate.get(toISODate(day)) ?? [];
            const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
            const overflowCount = dayEvents.length - visibleEvents.length;
            const inCurrentMonth = isSameMonth(day, visibleMonth);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                className={`flex min-h-28 flex-col gap-1 border-r border-b border-black/5 p-2 text-left dark:border-white/[0.06] [&:nth-child(7n)]:border-r-0 ${
                  inCurrentMonth
                    ? "bg-white dark:bg-[#171a28]"
                    : "bg-black/[0.015] dark:bg-white/[0.03]"
                } ${isSelected ? "ring-2 ring-[var(--fylmico-accent)]/40 ring-inset" : ""} hover:bg-black/[0.02] dark:hover:bg-white/[0.04]`}
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                type="button"
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                    isToday
                      ? "bg-[var(--fylmico-accent)] text-white"
                      : inCurrentMonth
                        ? "text-[#11142c] dark:text-[#f1f2f8]"
                        : "text-[#c3c7d4] dark:text-[#5c6178]"
                  }`}
                >
                  {day.getDate()}
                </span>

                <div className="grid gap-1">
                  {visibleEvents.map((event) => (
                    <CalendarEventPill event={event} key={event.id} />
                  ))}
                  {overflowCount > 0 ? (
                    <span className="px-2 text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
                      +{overflowCount} more
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
