"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { formatRelativeTime } from "@/lib/relative-time";
import { getProjectTimeline } from "@/services/base-workspace.service";
import type { ProjectTimelineEntry } from "@/types/base";

export function ProjectActivityTimeline({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<ProjectTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProjectTimeline(projectId)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <p className="p-6 text-center text-sm text-[#667085] dark:text-[#7d8299]">
        Loading timeline...
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-[#667085] dark:text-[#7d8299]">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="grid gap-0">
      {entries.map((entry) => (
        <div
          className="flex items-start gap-3 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/[0.06]"
          key={entry.id}
        >
          <History className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fylmico-accent)]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#11142c] dark:text-[#f1f2f8]">
              {entry.actorName ? (
                <strong className="font-semibold">{entry.actorName} </strong>
              ) : null}
              {entry.text}
            </p>
            <span className="text-xs text-[#667085] dark:text-[#7d8299]">
              {formatRelativeTime(entry.occurredAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
