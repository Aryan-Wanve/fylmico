"use client";

import { useState } from "react";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { StatCardsRow } from "@/components/dashboard/stat-cards-row";
import { UpcomingSchedulePanel } from "@/components/dashboard/upcoming-schedule-panel";
import { MyTasksPanel } from "@/components/dashboard/my-tasks-panel";
import { RecentProjectsPanel } from "@/components/dashboard/recent-projects-panel";
import { RecentActivityPanel } from "@/components/dashboard/recent-activity-panel";

export function HomeDashboard() {
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
    () => new Set()
  );

  function toggleTask(taskId: string) {
    setCompletedTaskIds((current) => {
      const next = new Set(current);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
    });
  }

  return (
    <div className="grid gap-6 p-8">
      <GreetingHeader />
      <StatCardsRow completedTaskIds={completedTaskIds} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <UpcomingSchedulePanel />
        <MyTasksPanel
          completedTaskIds={completedTaskIds}
          onToggleTask={toggleTask}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <RecentProjectsPanel />
        <RecentActivityPanel />
      </div>
    </div>
  );
}
