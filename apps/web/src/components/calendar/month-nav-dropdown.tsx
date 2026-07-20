"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { formatMonthYear, isSameMonth } from "@/lib/calendar-utils";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export function MonthNavDropdown({
  visibleMonth,
  onSelectMonth
}: {
  visibleMonth: Date;
  onSelectMonth: (date: Date) => void;
}) {
  const year = visibleMonth.getFullYear();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-lg font-bold text-[#11142c] hover:bg-black/[0.03] dark:text-[#f1f2f8] dark:hover:bg-white/[0.05]"
            type="button"
          >
            {formatMonthYear(visibleMonth)}
            <ChevronDown className="h-4 w-4 text-[#667085] dark:text-[#878ca0]" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-64">
        <div className="flex items-center justify-between px-1">
          <button
            aria-label="Previous year"
            className="grid h-7 w-7 place-items-center rounded-md text-[#667085] hover:bg-black/[0.04] dark:text-[#878ca0] dark:hover:bg-white/[0.06]"
            onClick={() =>
              onSelectMonth(new Date(year - 1, visibleMonth.getMonth(), 1))
            }
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {year}
          </strong>
          <button
            aria-label="Next year"
            className="grid h-7 w-7 place-items-center rounded-md text-[#667085] hover:bg-black/[0.04] dark:text-[#878ca0] dark:hover:bg-white/[0.06]"
            onClick={() =>
              onSelectMonth(new Date(year + 1, visibleMonth.getMonth(), 1))
            }
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1">
          {MONTH_LABELS.map((label, index) => {
            const isActive = isSameMonth(
              new Date(year, index, 1),
              visibleMonth
            );

            return (
              <button
                className={`rounded-lg py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-[var(--fylmico-accent)] text-white"
                    : "text-[#4b5268] hover:bg-black/[0.04] dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
                }`}
                key={label}
                onClick={() => onSelectMonth(new Date(year, index, 1))}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
