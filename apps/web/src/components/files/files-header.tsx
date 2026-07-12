"use client";

import { ChevronDown, FolderPlus, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function FilesHeader({
  onUpload,
  onNewFolder
}: {
  onUpload: () => void;
  onNewFolder: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          Files
        </h1>
        <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
          Store, organize and share all your production assets in one place.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <button
          className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
          onClick={onUpload}
          type="button"
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
        <button
          className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
          onClick={onNewFolder}
          type="button"
        >
          <FolderPlus className="h-4 w-4" />
          New Folder
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex h-10 items-center gap-2 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
                type="button"
              >
                New
                <ChevronDown className="h-4 w-4" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onUpload}>Upload files</DropdownMenuItem>
            <DropdownMenuItem onClick={onNewFolder}>
              New folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
