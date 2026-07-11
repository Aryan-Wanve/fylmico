"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { PROJECT_TYPES } from "@/components/projects/project-data";

export function ProjectsFiltersPopover({
  activeTypes,
  onToggleType
}: {
  activeTypes: Set<string>;
  onToggleType: (type: string) => void;
}) {
  const activeCount =
    activeTypes.size < PROJECT_TYPES.length ? activeTypes.size : 0;

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
            {activeCount > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#654cff]/10 px-1 text-xs font-bold text-[#654cff]">
                {activeCount}
              </span>
            ) : null}
          </button>
        }
      />
      <PopoverContent align="end" className="w-56">
        <strong className="px-1 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Production type
        </strong>
        <div className="grid gap-0.5">
          {PROJECT_TYPES.map((type) => (
            <div
              className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              key={type}
            >
              <Checkbox
                aria-label={`Toggle ${type} projects`}
                checked={activeTypes.has(type)}
                onCheckedChange={() => onToggleType(type)}
              />
              <span className="text-sm font-medium text-[#3a3f57] dark:text-[#b4b8cc]">
                {type}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
