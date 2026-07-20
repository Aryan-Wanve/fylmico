"use client";

import { ChevronDown, FolderPlus, Lock, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function FilesHeader({
  onUpload,
  onUploadFolder,
  onNewFolder,
  showSensitiveToggle = false,
  sensitiveView = false,
  onToggleSensitive
}: {
  onUpload: () => void;
  onUploadFolder?: () => void;
  onNewFolder: () => void;
  showSensitiveToggle?: boolean;
  sensitiveView?: boolean;
  onToggleSensitive?: () => void;
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
        {showSensitiveToggle ? (
          <button
            className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-bold ${
              sensitiveView
                ? "border-[var(--fylmico-accent)]/40 bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]"
                : "border-black/10 bg-white text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            }`}
            onClick={onToggleSensitive}
            type="button"
          >
            <Lock className="h-4 w-4" />
            {sensitiveView ? "House Files" : "Sensitive"}
          </button>
        ) : null}
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
                className="flex h-10 items-center gap-2 rounded-xl bg-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
                type="button"
              >
                New
                <ChevronDown className="h-4 w-4" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onUpload}>Upload files</DropdownMenuItem>
            {onUploadFolder ? (
              <DropdownMenuItem onClick={onUploadFolder}>
                Upload folder
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={onNewFolder}>
              New folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
