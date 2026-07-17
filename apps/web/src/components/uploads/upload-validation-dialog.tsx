"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatFileSize } from "@/components/files/file-data";

// A soft cap, not a hard block - Drive itself allows much larger files,
// but a file this size is worth a "are you sure" before it ties up the
// queue for a long time.
const LARGE_FILE_WARNING_BYTES = 5 * 1024 * 1024 * 1024;

const KNOWN_EXTENSIONS = new Set([
  "mp4",
  "mov",
  "mxf",
  "avi",
  "mkv",
  "webm",
  "mp3",
  "wav",
  "aac",
  "flac",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "tiff",
  "psd",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "zip",
  "rar",
  "7z",
  "ai",
  "eps",
  "svg",
  "prproj",
  "aep",
  "fcpxml",
  "drp"
]);

export type FileWarning = {
  kind: "duplicate" | "large" | "unrecognized";
  message: string;
};

function extensionOf(name: string): string | null {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return null;
  return name.slice(dot + 1).toLowerCase();
}

export function getFileWarnings(
  file: File,
  existingNames: string[]
): FileWarning[] {
  const warnings: FileWarning[] = [];
  const lowerExisting = new Set(existingNames.map((n) => n.toLowerCase()));

  if (lowerExisting.has(file.name.toLowerCase())) {
    warnings.push({
      kind: "duplicate",
      message: `A file named "${file.name}" already exists here.`
    });
  }
  if (file.size > LARGE_FILE_WARNING_BYTES) {
    warnings.push({
      kind: "large",
      message: `This is a large file (${formatFileSize(file.size)}) - it may take a while to upload.`
    });
  }
  const extension = extensionOf(file.name);
  if (!extension || !KNOWN_EXTENSIONS.has(extension)) {
    warnings.push({
      kind: "unrecognized",
      message: extension
        ? `".${extension}" isn't a format Fylmico recognizes - it will still upload, but previews may not work.`
        : "This file has no extension - previews may not work."
    });
  }
  return warnings;
}

type FlaggedFile = { file: File; warnings: FileWarning[] };

// Shown before enqueueing, only when at least one file has a warning -
// callers should skip this dialog entirely (go straight to enqueue) when
// getFileWarnings comes back empty for every file.
export function UploadValidationDialog({
  open,
  flagged,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  flagged: FlaggedFile[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (files: File[]) => void;
}) {
  const [renames, setRenames] = useState<Record<number, string>>({});

  function handleConfirm() {
    const files = flagged.map(({ file }, index) => {
      const renamed = renames[index];
      if (!renamed || renamed === file.name) return file;
      return new File([file], renamed, { type: file.type });
    });
    onConfirm(files);
    setRenames({});
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Check before uploading</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-96 gap-3 overflow-y-auto">
          {flagged.map(({ file, warnings }, index) => (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20"
              key={`${file.name}-${index}`}
            >
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                {file.name}
              </p>
              <ul className="mt-1.5 grid gap-1 pl-5 text-xs text-[#5f667d] dark:text-[#a8acbf]">
                {warnings.map((warning, warningIndex) => (
                  <li className="list-disc" key={warningIndex}>
                    {warning.message}
                  </li>
                ))}
              </ul>
              {warnings.some((w) => w.kind === "duplicate") ? (
                <label className="mt-2 grid gap-1">
                  <span className="text-xs font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                    Rename to avoid overwriting
                  </span>
                  <Input
                    onChange={(event) =>
                      setRenames((current) => ({
                        ...current,
                        [index]: event.target.value
                      }))
                    }
                    placeholder={file.name}
                    value={renames[index] ?? ""}
                  />
                </label>
              ) : null}
            </div>
          ))}
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={() => {
              setRenames({});
              onOpenChange(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} type="button">
            Continue Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
