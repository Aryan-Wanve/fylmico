"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReviewQueueItem } from "@/types/base";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReviewInfoPanel({ item }: { item: ReviewQueueItem }) {
  const [collapsed, setCollapsed] = useState(false);
  const settings = item.exportSettings ?? {};

  const rows: { label: string; value: string }[] = [
    { label: "Project", value: item.projectTitle ?? "—" },
    { label: "Client", value: item.clientName ?? "—" },
    { label: "Editor", value: item.editorName },
    { label: "Reviewer", value: item.assigneeName ?? "—" },
    { label: "Version", value: `v${item.version}` },
    { label: "Status", value: item.status },
    {
      label: "Due date",
      value: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"
    },
    { label: "Resolution", value: settings.Resolution || "—" },
    { label: "Codec", value: settings.Codec || "—" },
    { label: "Frame rate", value: settings["Frame Rate"] || "—" },
    { label: "Aspect ratio", value: settings["Aspect Ratio"] || "—" },
    { label: "Duration", value: formatDuration(item.file.durationSeconds) },
    {
      label: "Upload date",
      value: new Date(item.submittedAt).toLocaleString()
    },
    { label: "File size", value: formatSize(item.file.size) }
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#171a28] p-3">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setCollapsed((current) => !current)}
        type="button"
      >
        <span className="text-xs font-bold tracking-wide text-white/50 uppercase">
          Details
        </span>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-white/50" />
        ) : (
          <ChevronUp className="h-4 w-4 text-white/50" />
        )}
      </button>
      {!collapsed ? (
        <dl className="mt-2 grid gap-2">
          {rows.map((row) => (
            <div
              className="flex items-center justify-between gap-3 text-xs"
              key={row.label}
            >
              <dt className="text-white/50">{row.label}</dt>
              <dd className="truncate font-semibold text-white">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
