"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clapperboard, FolderKanban, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { useWorkspace } from "@/lib/workspace-context";
import { getDashboardSummary } from "@/services/base-workspace.service";
import { toISODate } from "@/lib/calendar-utils";
import type { DashboardSummary } from "@/types/base";

function formatShootDay(dateKey: string): string {
  const today = toISODate(new Date());
  const tomorrow = toISODate(new Date(Date.now() + 86400000));

  if (dateKey === today) {
    return "Today";
  }
  if (dateKey === tomorrow) {
    return "Tomorrow";
  }
  return new Date(dateKey).toLocaleDateString("en-US", {
    weekday: "long"
  });
}

export function StatCardsRow({
  completedTaskIds
}: {
  completedTaskIds: Set<string>;
}) {
  const { workspace, activeHouse } = useWorkspace();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDashboardSummary()
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
        }
      })
      .catch(() => {
        // Stat cards fail quietly.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dueToday = workspace.tasks.filter(
    (task) => task.status !== "done" && !completedTaskIds.has(task.id)
  ).length;

  const members = activeHouse?.members ?? [];
  const onlineMembers = members.filter((member) => member.status !== "offline");

  const projectsDelta = summary
    ? summary.activeProjectsSparkline[
        summary.activeProjectsSparkline.length - 1
      ] - summary.activeProjectsSparkline[0]
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={FolderKanban}
        note={
          projectsDelta > 0
            ? `+${projectsDelta} this week`
            : "No change this week"
        }
        noteTone={projectsDelta > 0 ? "positive" : "default"}
        sparklinePoints={summary?.activeProjectsSparkline}
        title="Active Projects"
        tone="violet"
        value={String(summary?.activeProjects ?? 0)}
      />
      <StatCard
        icon={Clapperboard}
        note={
          summary?.nextShoot
            ? `Next: ${formatShootDay(summary.nextShoot.date)}, ${summary.nextShoot.time}`
            : "Nothing scheduled"
        }
        sparklinePoints={summary?.upcomingShootsSparkline}
        title="Upcoming Shoots"
        tone="blue"
        value={String(summary?.upcomingShootsCount ?? 0)}
      />
      <StatCard
        icon={CheckCircle2}
        note={
          dueToday > 0
            ? `${Math.min(dueToday, 2)} high priority`
            : "All caught up"
        }
        noteTone="positive"
        title="Tasks Due Today"
        tone="green"
        value={String(dueToday)}
      />
      <StatCard
        extra={
          members.length > 0 ? (
            <div className="mt-2 flex -space-x-2">
              {members.slice(0, 5).map((member) => (
                <AvatarWithStatus
                  key={member.id}
                  label={member.name.slice(0, 2).toUpperCase()}
                  size="sm"
                  status={member.status}
                  userId={member.id}
                />
              ))}
            </div>
          ) : undefined
        }
        icon={Users}
        note="Online now"
        title="Team Online"
        tone="orange"
        value={`${onlineMembers.length} / ${members.length}`}
      />
    </div>
  );
}
