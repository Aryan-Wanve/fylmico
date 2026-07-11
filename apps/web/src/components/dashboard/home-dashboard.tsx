"use client";

import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { StatCardsRow } from "@/components/dashboard/stat-cards-row";
import { UpcomingSchedulePanel } from "@/components/dashboard/upcoming-schedule-panel";
import { MyTasksPanel } from "@/components/dashboard/my-tasks-panel";
import { RecentProjectsPanel } from "@/components/dashboard/recent-projects-panel";
import { RecentActivityPanel } from "@/components/dashboard/recent-activity-panel";
import { FadeInSection } from "@/components/layout/fade-in-section";

export function HomeDashboard() {
  return (
    <div className="grid gap-6 p-8">
      <FadeInSection delay={0}>
        <GreetingHeader />
      </FadeInSection>
      <FadeInSection delay={0.05}>
        <StatCardsRow />
      </FadeInSection>
      <FadeInSection delay={0.1}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
          <UpcomingSchedulePanel />
          <MyTasksPanel />
        </div>
      </FadeInSection>
      <FadeInSection delay={0.15}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
          <RecentProjectsPanel />
          <RecentActivityPanel />
        </div>
      </FadeInSection>
    </div>
  );
}
