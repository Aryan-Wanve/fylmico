"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type GroupByOption = "status" | "priority" | "project" | "assignee";

const OPTIONS: Array<{ value: GroupByOption; label: string }> = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "project", label: "Project" },
  { value: "assignee", label: "Assignee" }
];

export function TasksGroupByMenu({
  value,
  onChange
}: {
  value: GroupByOption;
  onChange: (value: GroupByOption) => void;
}) {
  const label = OPTIONS.find((option) => option.value === value)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
            type="button"
          >
            Group by: {label}
            <ChevronDown className="h-4 w-4" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup
          onValueChange={(next) => onChange(next as GroupByOption)}
          value={value}
        >
          {OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
