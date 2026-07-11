"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_STYLES,
  type EventCategory
} from "@/components/calendar/calendar-data";

export function CalendarFiltersPopover({
  activeCategories,
  onToggleCategory
}: {
  activeCategories: Set<EventCategory>;
  onToggleCategory: (category: EventCategory) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        }
      />
      <PopoverContent align="end" className="w-56">
        <strong className="px-1 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Event type
        </strong>
        <div className="grid gap-0.5">
          {CATEGORY_ORDER.map((category) => (
            <div
              className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              key={category}
            >
              <Checkbox
                aria-label={`Toggle ${CATEGORY_LABELS[category]} events`}
                checked={activeCategories.has(category)}
                onCheckedChange={() => onToggleCategory(category)}
              />
              <span
                className={`h-2 w-2 rounded-full ${CATEGORY_STYLES[category].dot}`}
              />
              <span className="text-sm font-medium text-[#3a3f57] dark:text-[#b4b8cc]">
                {CATEGORY_LABELS[category]}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
