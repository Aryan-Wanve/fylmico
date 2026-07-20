"use client";

import { Archive, Copy, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function ProjectCardMenu({
  onDuplicate,
  onArchive
}: {
  onDuplicate: () => void;
  onArchive: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="Project actions"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#667085] hover:bg-black/[0.04] hover:text-[#4b5268] dark:text-[#878ca0] dark:hover:bg-white/[0.06] dark:hover:text-[#c7cad9]"
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive} variant="destructive">
          <Archive className="h-4 w-4" />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
