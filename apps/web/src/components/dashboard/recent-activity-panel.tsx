"use client";

import { useEffect, useState } from "react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { getDashboardSummary } from "@/services/base-workspace.service";
import { formatRelativeTime } from "@/lib/relative-time";
import type { ActivityEntry } from "@/types/base";

export function RecentActivityPanel() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    getDashboardSummary()
      .then((summary) => {
        if (!cancelled) {
          setActivity(summary.recentActivity);
        }
      })
      .catch(() => {
        // Dashboard panel fails quietly.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardPanel action={{ label: "View all" }} title="Recent Activity">
      <div className="grid grid-cols-1">
        {activity.length > 0 ? (
          activity.map((entry) => (
            <div
              className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0 dark:border-white/[0.06]"
              key={entry.id}
            >
              <AvatarWithStatus
                label={entry.actorName.slice(0, 2).toUpperCase()}
                userId={entry.id}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[#272c45]">
                  <strong className="font-semibold">{entry.actorName}</strong>{" "}
                  {entry.text}
                </p>
                <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                  {formatRelativeTime(entry.occurredAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="px-6 py-6 text-center text-sm text-[#667085] dark:text-[#878ca0]">
            No recent activity yet.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
