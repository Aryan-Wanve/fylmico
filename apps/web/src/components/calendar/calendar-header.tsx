import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthNavDropdown } from "@/components/calendar/month-nav-dropdown";
import { CalendarViewTabs } from "@/components/calendar/calendar-view-tabs";
import { CalendarFiltersPopover } from "@/components/calendar/calendar-filters-popover";
import type { EventCategory } from "@/components/calendar/calendar-data";

export function CalendarHeader({
  visibleMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectMonth,
  activeCategories,
  onToggleCategory
}: {
  visibleMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectMonth: (date: Date) => void;
  activeCategories: Set<EventCategory>;
  onToggleCategory: (category: EventCategory) => void;
}) {
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-3xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Calendar
        </h1>
        <p className="mt-1 text-[#5f667d] dark:text-[#a8acbf]">
          See everything, plan ahead, and never miss a beat.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-[#171a28]">
            <button
              aria-label="Previous month"
              className="grid h-9 w-9 place-items-center text-[#4b5268] hover:bg-black/[0.03] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
              onClick={onPrevMonth}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next month"
              className="grid h-9 w-9 place-items-center border-l border-black/10 text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
              onClick={onNextMonth}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            className="h-9 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            onClick={onToday}
            type="button"
          >
            Today
          </button>

          <MonthNavDropdown
            onSelectMonth={onSelectMonth}
            visibleMonth={visibleMonth}
          />
        </div>

        <div className="flex items-center gap-3">
          <CalendarViewTabs />
          <CalendarFiltersPopover
            activeCategories={activeCategories}
            onToggleCategory={onToggleCategory}
          />
        </div>
      </div>
    </div>
  );
}
