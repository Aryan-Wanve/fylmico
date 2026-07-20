"use client";

import { useMemo, useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  addMonths,
  formatMonthYear,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  toISODate
} from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function parseISODate(datePart: string): Date | null {
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function DatePicker({
  value,
  onChange,
  withTime = false,
  placeholder = "Select date",
  className,
  disabled,
  minDate
}: {
  value?: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
}) {
  const [datePart, timePart] = useMemo(() => {
    const [d, t] = (value ?? "").split("T");
    return [d ?? "", t ?? ""];
  }, [value]);

  const selected = datePart ? parseISODate(datePart) : null;
  const min = minDate ? parseISODate(minDate) : null;
  const [visibleMonth, setVisibleMonth] = useState(selected ?? new Date());
  const [open, setOpen] = useState(false);
  const weeks = getMonthGrid(visibleMonth);

  function pickDay(day: Date) {
    const iso = toISODate(day);
    onChange(withTime ? `${iso}T${timePart || "00:00"}` : iso);
    setVisibleMonth(day);
    if (!withTime) {
      setOpen(false);
    }
  }

  function changeTime(time: string) {
    if (!datePart) return;
    onChange(`${datePart}T${time}`);
  }

  const label = selected
    ? selected.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) + (withTime && timePart ? ` · ${timePart}` : "")
    : placeholder;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <button
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-lg border border-black/10 bg-transparent px-3 text-left text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]",
              className
            )}
            disabled={disabled}
            type="button"
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-[#8a90a3]" />
            <span
              className={cn("flex-1 truncate", !selected && "text-[#8a90a3]")}
            >
              {label}
            </span>
          </button>
        }
      />
      <PopoverContent className="w-64 p-3">
        <div className="flex items-center justify-between pb-2">
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {formatMonthYear(visibleMonth)}
          </strong>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous month"
              className="grid h-6 w-6 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              type="button"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              aria-label="Next month"
              className="grid h-6 w-6 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              type="button"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((day, index) => (
            <div
              className="grid h-7 place-items-center text-[0.7rem] font-bold text-[#c3c7d4] dark:text-[#5c6178]"
              key={`${day}-${index}`}
            >
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week) => (
          <div className="grid grid-cols-7" key={week[0].toISOString()}>
            {week.map((day) => {
              const inCurrentMonth = isSameMonth(day, visibleMonth);
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isDisabled = min
                ? day < min && !isSameDay(day, min)
                : false;

              return (
                <button
                  className="grid h-8 place-items-center disabled:cursor-not-allowed"
                  disabled={isDisabled}
                  key={day.toISOString()}
                  onClick={() => pickDay(day)}
                  type="button"
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full text-xs font-semibold",
                      isSelected
                        ? "bg-[var(--fylmico-accent)] text-white"
                        : isDisabled
                          ? "text-[#d8dae3] dark:text-[#3a3f57]"
                          : inCurrentMonth
                            ? "text-[#4b5268] hover:bg-black/[0.04] dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
                            : "text-[#d8dae3]"
                    )}
                  >
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {withTime ? (
          <input
            className="mt-2 h-9 w-full rounded-lg border border-black/10 bg-transparent px-2.5 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
            onChange={(event) => changeTime(event.target.value)}
            type="time"
            value={timePart || "00:00"}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
