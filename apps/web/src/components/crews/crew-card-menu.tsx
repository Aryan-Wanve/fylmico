"use client";

import { MessageSquare, MoreVertical, Pencil, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function CrewCardMenu({
  onRemove,
  onMessage,
  onEdit
}: {
  onRemove: () => void;
  onMessage: () => void;
  onEdit: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="Member actions"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#8a90a3] hover:bg-black/[0.04] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:bg-white/[0.06] dark:hover:text-[#c7cad9]"
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMessage}>
          <MessageSquare className="h-4 w-4" />
          Message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRemove} variant="destructive">
          <UserX className="h-4 w-4" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
