import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { formatRelativeTime } from "@/lib/relative-time";
import type { FilesSummary } from "@/types/base";

export function RecentFileActivityPanel({
  summary
}: {
  summary: FilesSummary | null;
}) {
  const recent = summary?.recent ?? [];

  return (
    <DashboardPanel title="Recent Activity">
      <div className="grid">
        {recent.length > 0 ? (
          recent.map((entry) => (
            <div
              className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0 dark:border-white/[0.06]"
              key={entry.id}
            >
              <AvatarWithStatus
                label={entry.uploadedByName.slice(0, 2).toUpperCase()}
                userId={entry.id}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[#272c45]">
                  <strong className="font-semibold">
                    {entry.uploadedByName}
                  </strong>{" "}
                  uploaded {entry.name}
                </p>
                <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  {formatRelativeTime(entry.createdAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="px-6 py-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
            No activity yet.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
