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
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Files
        </h1>
        <p className="mt-1 text-[#5f667d] dark:text-[#a8acbf]">
          Store, organize and share all your production assets in one place.
        </p>
      </div>
      <div className="flex items-center gap-3">
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
