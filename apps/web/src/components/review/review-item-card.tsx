"use client";

import { MessageSquare, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { FILE_KIND_META, inferFileKind } from "@/components/files/file-data";
import { PRIORITY_META, toInitials } from "@/components/tasks/task-data";
import { formatRelativeTime } from "@/lib/relative-time";
import type { DeliverableStatus, ReviewQueueItem } from "@/types/base";

export const REVIEW_STATUS_META: Record<
  DeliverableStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className:
      "bg-black/[0.04] text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]"
  },
  review: {
    label: "Waiting for Review",
    className: "bg-amber-50 text-amber-600"
  },
  revision: {
    label: "Changes Requested",
    className: "bg-red-50 text-red-600"
  },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-600" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" }
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function ReviewItemCard({
  item,
  selected,
  onToggleSelect,
  onOpen
}: {
  item: ReviewQueueItem;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}) {
  const kind = inferFileKind("file", item.file.mimeType);
  const meta = FILE_KIND_META[kind];
  const Icon = meta.icon;
  const overdue = Boolean(item.dueDate && new Date(item.dueDate) < new Date());

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <Checkbox checked={selected} onCheckedChange={onToggleSelect} />

      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${meta.bg} dark:bg-white/[0.06]`}
      >
        <Icon className={`h-5 w-5 ${meta.color}`} />
      </div>

      <button
        className="grid min-w-0 flex-1 gap-1 text-left"
        onClick={onOpen}
        type="button"
      >
        <div className="flex flex-wrap items-center gap-2">
          <strong className="truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {item.taskTitle ?? item.file.name}
          </strong>
          <span className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
            v{item.version}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-bold ${REVIEW_STATUS_META[item.status].className}`}
          >
            {REVIEW_STATUS_META[item.status].label}
          </span>
          {overdue ? (
            <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
              Overdue
            </span>
          ) : null}
          {item.version > 1 ? (
            <span className="flex items-center gap-1 rounded-md bg-black/[0.04] px-1.5 py-0.5 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
              <RotateCcw className="h-3 w-3" />
              {item.version - 1}
            </span>
          ) : null}
          {item.unresolvedCommentCount > 0 ? (
            <span className="flex items-center gap-1 rounded-md bg-[var(--fylmico-accent)]/10 px-1.5 py-0.5 text-xs font-bold text-[var(--fylmico-accent)]">
              <MessageSquare className="h-3 w-3" />
              {item.unresolvedCommentCount}
            </span>
          ) : null}
        </div>
        <span className="truncate text-xs text-[#667085] dark:text-[#7d8299]">
          {item.projectTitle ?? "No project"}
          {item.clientName ? ` · ${item.clientName}` : ""} · {item.file.name}
          {item.file.size ? ` · ${formatSize(item.file.size)}` : ""}
          {item.file.durationSeconds
            ? ` · ${formatDuration(item.file.durationSeconds)}`
            : ""}
          {item.exportSettings?.Resolution
            ? ` · ${item.exportSettings.Resolution}`
            : ""}
        </span>
        {item.notes ? (
          <span className="truncate text-xs text-[#5f667d] dark:text-[#a8acbf]">
            {item.notes}
          </span>
        ) : null}
      </button>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${PRIORITY_META[item.priority].bar} text-white`}
        >
          {PRIORITY_META[item.priority].label}
        </span>
        <div className="flex items-center gap-2">
          <AvatarWithStatus
            label={toInitials(item.editorName)}
            size="sm"
            userId={item.editorId}
          />
          <div className="hidden flex-col sm:flex">
            <span className="text-xs font-semibold text-[#11142c] dark:text-[#f1f2f8]">
              {item.editorName}
            </span>
            <span className="text-xs text-[#667085] dark:text-[#7d8299]">
              {formatRelativeTime(item.submittedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
