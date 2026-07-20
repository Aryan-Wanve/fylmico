"use client";

import { formatRelativeTime } from "@/lib/relative-time";
import type { DeliverableActivityEntry } from "@/types/base";

const TYPE_LABELS: Record<string, string> = {
  version_uploaded: "uploaded",
  review_started: "started reviewing",
  changes_requested: "requested changes",
  rejected: "rejected",
  approved: "approved",
  delivered: "delivered to client",
  portfolio_added: "added to portfolio"
};

export function ReviewActivityPanel({
  entries
}: {
  entries: DeliverableActivityEntry[];
}) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-white/40">No activity yet.</p>
    );
  }

  return (
    <div className="grid gap-3">
      {entries.map((entry) => (
        <div className="flex items-start gap-2.5 text-xs" key={entry.id}>
          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--fylmico-accent)]" />
          <div>
            <p className="text-white">
              <strong>{entry.actorName}</strong>{" "}
              {TYPE_LABELS[entry.type] ?? entry.type}
              {entry.toValue ? ` (${entry.toValue})` : ""}
            </p>
            <span className="text-white/40">
              {formatRelativeTime(entry.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
