import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import {
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  type CalendarEvent
} from "@/components/calendar/calendar-data";
import { toISODate } from "@/lib/calendar-utils";

export function CalendarDayGrid({
  selectedDate,
  events,
  onPrevDay,
  onNextDay
}: {
  selectedDate: Date;
  events: CalendarEvent[];
  onPrevDay: () => void;
  onNextDay: () => void;
}) {
  const dayKey = toISODate(selectedDate);
  const dayEvents = events
    .filter((event) => event.date === dayKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/[0.06]">
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
          })}
        </strong>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous day"
            className="grid h-7 w-7 place-items-center rounded-lg text-[#667085] hover:bg-black/[0.04] dark:text-[#878ca0] dark:hover:bg-white/[0.06]"
            onClick={onPrevDay}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Next day"
            className="grid h-7 w-7 place-items-center rounded-lg text-[#667085] hover:bg-black/[0.04] dark:text-[#878ca0] dark:hover:bg-white/[0.06]"
            onClick={onNextDay}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid min-h-40 gap-2 p-4">
        {dayEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#667085] dark:text-[#878ca0]">
            No events scheduled for this day.
          </p>
        ) : (
          dayEvents.map((event) => {
            const styles = CATEGORY_STYLES[event.category];

            return (
              <div
                className="flex items-start gap-3 rounded-xl border border-black/[0.06] p-3 dark:border-white/[0.08]"
                key={event.id}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                      {event.title}
                    </strong>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold ${styles.chip}`}
                    >
                      {CATEGORY_LABELS[event.category]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#667085] dark:text-[#878ca0]">
                    <span>{event.time}</span>
                    {event.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
