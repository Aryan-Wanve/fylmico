"use client";

import { Copy, MoreVertical, Sparkles, Trash2, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function TaskCardMenu({
  onUploadShootData,
  onDuplicate,
  onSaveAsTemplate,
  onDelete
}: {
  onUploadShootData?: () => void;
  onDuplicate: () => void;
  onSaveAsTemplate: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="Task actions"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#667085] hover:bg-black/[0.04] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:bg-white/[0.06] dark:hover:text-[#c7cad9]"
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        {onUploadShootData ? (
          <DropdownMenuItem onClick={onUploadShootData}>
            <Upload className="h-4 w-4" />
            Upload Shoot Data
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSaveAsTemplate}>
          <Sparkles className="h-4 w-4" />
          Save as Template
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
