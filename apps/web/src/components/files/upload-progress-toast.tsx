"use client";

import { CheckCircle2, X } from "lucide-react";
import { formatFileSize } from "@/components/files/file-data";

export interface UploadProgressItem {
  id: string;
  fileName: string;
  loaded: number;
  total: number;
  speedBytesPerSec: number;
  status: "uploading" | "done" | "error";
  errorMessage?: string;
}

export function UploadProgressToast({
  uploads,
  onDismiss,
  onCancel
}: {
  uploads: UploadProgressItem[];
  onDismiss: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 grid w-[22rem] max-w-[calc(100vw-2rem)] gap-2 sm:right-6 sm:bottom-6">
      {uploads.map((upload) => {
        const percent =
          upload.total > 0
            ? Math.min(100, Math.round((upload.loaded / upload.total) * 100))
            : 0;

        return (
          <div
            className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.14)] dark:border-white/[0.08] dark:bg-[#171a28]"
            key={upload.id}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {upload.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16c784]" />
                ) : null}
                <span className="truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {upload.fileName}
                </span>
              </div>
              <button
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#8a90a3] hover:bg-black/[0.04] hover:text-[#11142c] dark:text-[#7d8299] dark:hover:bg-white/[0.06] dark:hover:text-[#f1f2f8]"
                onClick={() =>
                  upload.status === "uploading"
                    ? onCancel(upload.id)
                    : onDismiss(upload.id)
                }
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {upload.status === "error" ? (
              <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                {upload.errorMessage ?? "Upload failed."}
              </p>
            ) : (
              <>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full transition-[width] duration-150 ${
                      upload.status === "done" ? "bg-[#16c784]" : "bg-[#654cff]"
                    }`}
                    style={{
                      width: `${upload.status === "done" ? 100 : percent}%`
                    }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  <span>
                    {upload.status === "done"
                      ? `${formatFileSize(upload.total)} uploaded`
                      : `${percent}% • ${formatFileSize(upload.loaded)} of ${formatFileSize(upload.total)}`}
                  </span>
                  {upload.status === "uploading" ? (
                    <span>{formatFileSize(upload.speedBytesPerSec)}/s</span>
                  ) : null}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
