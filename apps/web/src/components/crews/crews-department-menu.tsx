"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DEPARTMENT_ORDER, type Department } from "@/components/crews/crew-data";

export function CrewsDepartmentMenu({
  value,
  onChange
}: {
  value: Department | "all";
  onChange: (value: Department | "all") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
            type="button"
          >
            {value === "all" ? "All Departments" : value}
            <ChevronDown className="h-4 w-4" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup
          onValueChange={(next) => onChange(next as Department | "all")}
          value={value}
        >
          <DropdownMenuRadioItem value="all">
            All Departments
          </DropdownMenuRadioItem>
          {DEPARTMENT_ORDER.map((department) => (
            <DropdownMenuRadioItem key={department} value={department}>
              {department}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
