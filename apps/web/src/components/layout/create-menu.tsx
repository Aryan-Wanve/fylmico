"use client";

import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const createOptions = [
  { label: "New project", hint: "Frontend contract only" },
  { label: "New task", hint: "Uses mock scheduler" },
  { label: "New chat room", hint: "Backend todo" }
];

export function CreateMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="h-10 gap-1.5 rounded-xl bg-gradient-to-br from-[#654cff] to-[#5b3ff0] px-4 font-bold text-white hover:opacity-95"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Create
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {createOptions.map((option) => (
          <DropdownMenuItem
            className="flex-col items-start gap-0"
            key={option.label}
          >
            <span className="font-semibold text-[#12142b]">{option.label}</span>
            <span className="text-xs text-[#6a7086]">{option.hint}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
