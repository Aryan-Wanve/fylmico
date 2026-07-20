import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarEventPill } from "@/components/calendar/calendar-event-pill";
import type { CalendarEvent } from "@/components/calendar/calendar-data";
import {
  formatDayLabel,
  getWeekDays,
  isSameDay,
  toISODate
} from "@/lib/calendar-utils";

export function CalendarWeekGrid({
  anchorDate,
  events,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek
}: {
  anchorDate: Date;
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}) {
  const week = getWeekDays(anchorDate);
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
    <div className="min-w-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/[0.06]">
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          {formatDayLabel(week[0])} &ndash; {formatDayLabel(week[6])}
        </strong>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous week"
            className="grid h-7 w-7 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
            onClick={onPrevWeek}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Next week"
            className="grid h-7 w-7 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
            onClick={onNextWeek}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <div className="grid min-w-[56rem] grid-cols-7">
          {week.map((day) => {
            const dayEvents = eventsByDate.get(toISODate(day)) ?? [];
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                className={`flex min-h-40 flex-col gap-1 border-r border-black/5 p-2 text-left last:border-r-0 dark:border-white/[0.06] ${
                  isSelected
                    ? "ring-2 ring-[var(--fylmico-accent)]/40 ring-inset"
                    : ""
                } hover:bg-black/[0.02] dark:hover:bg-white/[0.04]`}
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                type="button"
              >
                <span
                  className={`grid h-6 w-fit min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold ${
                    isToday
                      ? "bg-[var(--fylmico-accent)] text-white"
                      : "text-[#11142c] dark:text-[#f1f2f8]"
                  }`}
                >
                  {formatDayLabel(day)}
                </span>

                <div className="grid gap-1">
                  {dayEvents.map((event) => (
                    <CalendarEventPill event={event} key={event.id} />
                  ))}
                  {dayEvents.length === 0 ? (
                    <span className="px-1 text-xs text-[#c3c7d4] dark:text-[#5c6178]">
                      No events
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
