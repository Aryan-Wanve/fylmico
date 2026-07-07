"use client";

import { CheckCircle2, Clapperboard, FolderKanban, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { useWorkspace } from "@/lib/workspace-context";

export function StatCardsRow({
  completedTaskIds
}: {
  completedTaskIds: Set<string>;
}) {
  const { workspace, activeHouse } = useWorkspace();

  const dueToday = workspace.tasks.filter(
    (task) => task.status !== "done" && !completedTaskIds.has(task.id)
  ).length;

  const members = activeHouse?.members ?? [];
  const onlineMembers = members.filter((member) => member.status !== "offline");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={FolderKanban}
        note="+2 this month"
        noteTone="positive"
        sparklinePoints={[4, 5, 5, 7, 6, 8, 9]}
        title="Active Projects"
        tone="violet"
        value="6"
      />
      <StatCard
        icon={Clapperboard}
        note="Next: Tomorrow, 9:00 AM"
        sparklinePoints={[6, 5, 6, 5, 7, 6, 7]}
        title="Upcoming Shoots"
        tone="blue"
        value="3"
      />
      <StatCard
        icon={CheckCircle2}
        note={
          dueToday > 0
            ? `${Math.min(dueToday, 2)} high priority`
            : "All caught up"
        }
        noteTone="positive"
        sparklinePoints={[3, 5, 4, 6, 5, 7, dueToday || 1]}
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
        sparklinePoints={[5, 6, 6, 7, 8, 7, 9]}
        title="Team Online"
        tone="orange"
        value={`${onlineMembers.length} / ${members.length}`}
      />
    </div>
  );
}
