"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCw,
  Upload,
  WifiOff,
  X
} from "lucide-react";
import { formatFileSize } from "@/components/files/file-data";
import { useUploadQueue } from "@/lib/uploads/use-upload-queue";
import type { UploadQueueItem } from "@/lib/uploads/upload-queue-store";

function formatEta(loaded: number, total: number, speed: number): string {
  if (speed <= 0 || loaded >= total) return "";
  const remainingSeconds = (total - loaded) / speed;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = Math.round(remainingSeconds % 60);
  return minutes > 0
    ? `${minutes}m ${seconds}s remaining`
    : `${seconds}s remaining`;
}

function StatusLine({ item }: { item: UploadQueueItem }) {
  if (item.status === "waiting-for-connection") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <WifiOff className="h-3.5 w-3.5" />
        Waiting for connection...
      </p>
    );
  }
  if (item.status === "needs-reselect") {
    return (
      <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
        Didn&apos;t finish last time - re-select the file to resume from{" "}
        {formatFileSize(item.loaded)}.
      </p>
    );
  }
  if (item.status === "error") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        {item.errorMessage ?? "Upload failed."}
      </p>
    );
  }

  const percent =
    item.fileSize > 0
      ? Math.min(100, Math.round((item.loaded / item.fileSize) * 100))
      : 0;
  const eta = formatEta(item.loaded, item.fileSize, item.speedBytesPerSec);

  return (
    <>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        <div
          className={`h-full rounded-full transition-[width] duration-150 ${
            item.status === "done"
              ? "bg-[#16c784]"
              : "bg-[var(--fylmico-accent)]"
          }`}
          style={{ width: `${item.status === "done" ? 100 : percent}%` }}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 text-xs text-[#667085] dark:text-[#878ca0]">
        <span>
          {item.status === "done"
            ? `${formatFileSize(item.fileSize)} uploaded`
            : `${percent}% • ${formatFileSize(item.loaded)} of ${formatFileSize(item.fileSize)}`}
        </span>
        {item.status === "uploading" ? (
          <span>
            {formatFileSize(item.speedBytesPerSec)}/s{eta ? ` • ${eta}` : ""}
          </span>
        ) : null}
      </div>
    </>
  );
}

function QueueRow({ item }: { item: UploadQueueItem }) {
  const { pause, resume, cancel, reattach } = useUploadQueue();
  const reselectInputRef = useRef<HTMLInputElement>(null);

  function handleReselect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      void reattach(item.id, file);
    }
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.14)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {item.status === "done" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16c784]" />
          ) : null}
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
              {item.fileName}
            </span>
            <span className="block truncate text-[0.68rem] text-[#667085] dark:text-[#878ca0]">
              {item.destinationLabel}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {item.status === "uploading" ? (
            <button
              className="grid h-6 w-6 place-items-center rounded-full text-[#667085] hover:bg-black/[0.04] hover:text-[#11142c] dark:text-[#878ca0] dark:hover:bg-white/[0.06] dark:hover:text-[#f1f2f8]"
              onClick={() => pause(item.id)}
              title="Pause"
              type="button"
            >
              <Pause className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {item.status === "paused" ||
          item.status === "error" ||
          item.status === "waiting-for-connection" ? (
            <button
              className="grid h-6 w-6 place-items-center rounded-full text-[var(--fylmico-accent)] hover:bg-[var(--fylmico-accent)]/10"
              onClick={() => resume(item.id)}
              title={item.status === "paused" ? "Resume" : "Retry"}
              type="button"
            >
              {item.status === "paused" ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <RotateCw className="h-3.5 w-3.5" />
              )}
            </button>
          ) : null}
          {item.status === "needs-reselect" ? (
            <>
              <button
                className="grid h-6 w-6 place-items-center rounded-full text-[var(--fylmico-accent)] hover:bg-[var(--fylmico-accent)]/10"
                onClick={() => reselectInputRef.current?.click()}
                title="Re-select file"
                type="button"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <input
                className="hidden"
                onChange={handleReselect}
                ref={reselectInputRef}
                type="file"
              />
            </>
          ) : null}
          <button
            className="grid h-6 w-6 place-items-center rounded-full text-[#667085] hover:bg-black/[0.04] hover:text-[#11142c] dark:text-[#878ca0] dark:hover:bg-white/[0.06] dark:hover:text-[#f1f2f8]"
            onClick={() => cancel(item.id)}
            title="Cancel"
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <StatusLine item={item} />
    </div>
  );
}

// Mounted once at the app-shell level so it persists across in-app
// navigation - every upload path in the app (Files, Submit Draft, task
// attachments, shoot footage) enqueues through the same global queue via
// useUploadQueue, so this one panel reflects all of them.
export function UploadQueuePanel() {
  const { queue } = useUploadQueue();
  const [collapsed, setCollapsed] = useState(false);

  if (queue.length === 0) {
    return null;
  }

  const activeCount = queue.filter(
    (item) => item.status === "uploading" || item.status === "queued"
  ).length;

  return (
    <div className="fixed right-4 bottom-4 z-50 grid w-[22rem] max-w-[calc(100vw-2rem)] gap-2 sm:right-6 sm:bottom-6">
      <button
        className="flex items-center justify-between gap-2 rounded-xl border border-black/[0.06] bg-white px-3.5 py-2 text-xs font-bold text-[#11142c] shadow-[0_1rem_3rem_rgba(53,45,124,0.14)] dark:border-white/[0.08] dark:bg-[#171a28] dark:text-[#f1f2f8]"
        onClick={() => setCollapsed((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-1.5">
          <Upload className="h-3.5 w-3.5 text-[var(--fylmico-accent)]" />
          {activeCount > 0
            ? `Uploading ${activeCount} file${activeCount === 1 ? "" : "s"}`
            : `${queue.length} upload${queue.length === 1 ? "" : "s"}`}
        </span>
        {collapsed ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {!collapsed
        ? queue.map((item) => <QueueRow item={item} key={item.id} />)
        : null}
    </div>
  );
}
