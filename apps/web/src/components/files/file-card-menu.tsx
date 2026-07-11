"use client";

import { Download, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function FileCardMenu({
  onDelete,
  onDownload
}: {
  onDelete: () => void;
  onDownload?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="File actions"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#8a90a3] hover:bg-black/[0.04] hover:text-[#4b5268]"
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-36">
        {onDownload ? (
          <DropdownMenuItem onClick={onDownload}>
            <Download className="h-4 w-4" />
            Download
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={onDelete} variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
