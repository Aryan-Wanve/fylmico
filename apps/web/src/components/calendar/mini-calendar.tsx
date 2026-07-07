import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatMonthYear,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  toISODate
} from "@/lib/calendar-utils";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function MiniCalendar({
  visibleMonth,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  onSelectDate,
  eventDateSet
}: {
  visibleMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  eventDateSet: Set<string>;
}) {
  const weeks = getMonthGrid(visibleMonth);
  const today = new Date();

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
      <div className="flex items-center justify-between px-1 pb-3">
        <strong className="text-sm font-bold text-[#11142c]">
          {formatMonthYear(visibleMonth)}
        </strong>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous month"
            className="grid h-6 w-6 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04]"
            onClick={onPrevMonth}
            type="button"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Next month"
            className="grid h-6 w-6 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04]"
            onClick={onNextMonth}
            type="button"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            className="grid h-7 place-items-center text-[0.7rem] font-bold text-[#c3c7d4]"
            key={`${label}-${index}`}
          >
            {label}
          </div>
        ))}
      </div>

      {weeks.map((week) => (
        <div className="grid grid-cols-7" key={week[0].toISOString()}>
          {week.map((day) => {
            const inCurrentMonth = isSameMonth(day, visibleMonth);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const hasEvents = eventDateSet.has(toISODate(day));

            return (
              <button
                className="grid h-8 place-items-center"
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                type="button"
              >
                <span
                  className={`relative grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                    isToday
                      ? "bg-[#654cff] text-white"
                      : isSelected
                        ? "bg-[#654cff]/10 text-[#654cff]"
                        : inCurrentMonth
                          ? "text-[#4b5268] hover:bg-black/[0.04]"
                          : "text-[#d8dae3]"
                  }`}
                >
                  {day.getDate()}
                  {hasEvents && !isToday ? (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#654cff]" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
