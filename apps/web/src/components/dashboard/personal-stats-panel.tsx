"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Flame, Target } from "lucide-react";
import { getMyStats } from "@/services/base-workspace.service";
import type { PersonalStats } from "@/types/base";

function StatTile({
  icon: Icon,
  label,
  value,
  note
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center gap-2 text-xs font-bold text-[#8a90a3] dark:text-[#7d8299]">
        <Icon className="h-4 w-4 text-[var(--fylmico-accent)]" />
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          {value}
        </span>
      </div>
      <p className="mt-1 text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
        {note}
      </p>
    </div>
  );
}

export function PersonalStatsPanel() {
  const [stats, setStats] = useState<PersonalStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMyStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch(() => {
        // Fails quietly.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        icon={Flame}
        label="Work Streak"
        note={`Best: ${stats.workStreak.best} Days`}
        value={`${stats.workStreak.current} Days`}
      />
      <StatTile
        icon={Clock}
        label="Working Hours"
        note={`This Week: ${stats.workingHours.week}h`}
        value={`${stats.workingHours.today}h`}
      />
      <StatTile
        icon={CheckCircle2}
        label="Completed Tasks"
        note={`${stats.tasksPending} pending`}
        value={String(stats.tasksCompleted)}
      />
      <StatTile
        icon={Target}
        label="On-Time Rate"
        note={`${stats.completionRate}% completion rate`}
        value={`${stats.onTimePercentage}%`}
      />
    </div>
  );
}
