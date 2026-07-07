"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { PRIORITY_META, PRIORITY_ORDER } from "@/components/tasks/task-data";
import type { TaskPriority } from "@/components/tasks/task-data";

export function TasksFiltersPopover({
  activePriorities,
  onTogglePriority
}: {
  activePriorities: Set<TaskPriority>;
  onTogglePriority: (priority: TaskPriority) => void;
}) {
  const activeCount =
    activePriorities.size < PRIORITY_ORDER.length ? activePriorities.size : 0;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
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
      <PopoverContent align="start" className="w-52">
        <strong className="px-1 text-sm font-bold text-[#11142c]">
          Priority
        </strong>
        <div className="grid gap-0.5">
          {PRIORITY_ORDER.map((priority) => (
            <div
              className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-black/[0.03]"
              key={priority}
            >
              <Checkbox
                aria-label={`Toggle ${PRIORITY_META[priority].label} priority`}
                checked={activePriorities.has(priority)}
                onCheckedChange={() => onTogglePriority(priority)}
              />
              <span className="text-sm font-medium text-[#3a3f57]">
                {PRIORITY_META[priority].label}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
