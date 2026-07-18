"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  TASK_TYPE_LABELS,
  TASK_TYPES
} from "@/components/tasks/task-data";
import type {
  HouseMember,
  OwnerType,
  TaskPriority,
  TaskStatus,
  TaskType
} from "@/types/base";

const OWNER_TYPE_OPTIONS: (OwnerType | "none")[] = [
  "project",
  "client",
  "none"
];
const OWNER_TYPE_LABELS: Record<OwnerType | "none", string> = {
  project: "Project",
  client: "Client",
  none: "No Owner"
};

function FilterSection<T extends string>({
  title,
  options,
  active,
  onToggle,
  label
}: {
  title: string;
  options: T[];
  active: Set<T>;
  onToggle: (value: T) => void;
  label: (value: T) => string;
}) {
  return (
    <div className="grid gap-0.5">
      <strong className="px-1 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
        {title}
      </strong>
      {options.map((option) => (
        <div
          className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
          key={option}
        >
          <Checkbox
            aria-label={`Toggle ${label(option)}`}
            checked={active.has(option)}
            onCheckedChange={() => onToggle(option)}
          />
          <span className="text-sm font-medium text-[#3a3f57] dark:text-[#b4b8cc]">
            {label(option)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TasksFiltersPopover({
  activePriorities,
  onTogglePriority,
  activeStatuses,
  onToggleStatus,
  activeTypes,
  onToggleType,
  activeOwnerTypes,
  onToggleOwnerType,
  members,
  activeAssigneeIds,
  onToggleAssignee
}: {
  activePriorities: Set<TaskPriority>;
  onTogglePriority: (priority: TaskPriority) => void;
  activeStatuses: Set<TaskStatus>;
  onToggleStatus: (status: TaskStatus) => void;
  activeTypes: Set<TaskType>;
  onToggleType: (type: TaskType) => void;
  activeOwnerTypes: Set<OwnerType | "none">;
  onToggleOwnerType: (value: OwnerType | "none") => void;
  members: HouseMember[];
  activeAssigneeIds: Set<string>;
  onToggleAssignee: (userId: string) => void;
}) {
  const activeCount =
    (activePriorities.size < PRIORITY_ORDER.length ? 1 : 0) +
    (activeStatuses.size < STATUS_ORDER.length ? 1 : 0) +
    (activeTypes.size < TASK_TYPES.length ? 1 : 0) +
    (activeOwnerTypes.size < OWNER_TYPE_OPTIONS.length ? 1 : 0) +
    (activeAssigneeIds.size < members.length ? 1 : 0);

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
      <PopoverContent
        align="start"
        className="grid max-h-96 w-56 gap-3 overflow-y-auto"
      >
        <FilterSection
          active={activePriorities}
          label={(value) => PRIORITY_META[value].label}
          onToggle={onTogglePriority}
          options={PRIORITY_ORDER}
          title="Priority"
        />
        <FilterSection
          active={activeStatuses}
          label={(value) => STATUS_META[value].label}
          onToggle={onToggleStatus}
          options={STATUS_ORDER}
          title="Status"
        />
        <FilterSection
          active={activeTypes}
          label={(value) => TASK_TYPE_LABELS[value]}
          onToggle={onToggleType}
          options={TASK_TYPES}
          title="Type"
        />
        <FilterSection
          active={activeOwnerTypes}
          label={(value) => OWNER_TYPE_LABELS[value]}
          onToggle={onToggleOwnerType}
          options={OWNER_TYPE_OPTIONS}
          title="Owner"
        />
        {members.length > 0 ? (
          <FilterSection
            active={activeAssigneeIds}
            label={(value) =>
              members.find((m) => m.id === value)?.name ?? value
            }
            onToggle={onToggleAssignee}
            options={members.map((member) => member.id)}
            title="Assignee"
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
