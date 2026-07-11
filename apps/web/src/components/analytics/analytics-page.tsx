"use client";

import { useEffect, useState } from "react";
import { AnalyticsHeader } from "@/components/analytics/analytics-header";
import {
  LogTimePopover,
  type LogTimeInput
} from "@/components/analytics/log-time-popover";
import { StatCardsRow } from "@/components/analytics/stat-cards-row";
import { ProjectProgressPanel } from "@/components/analytics/project-progress-panel";
import { TaskStatusPanel } from "@/components/analytics/task-status-panel";
import { TimeLoggedPanel } from "@/components/analytics/time-logged-panel";
import { TimeDistributionPanel } from "@/components/analytics/time-distribution-panel";
import { ActivityHeatmapPanel } from "@/components/analytics/activity-heatmap-panel";
import { TopContributorsPanel } from "@/components/analytics/top-contributors-panel";
import { TopActiveProjectsPanel } from "@/components/analytics/top-active-projects-panel";
import { TeamWorkloadPanel } from "@/components/analytics/team-workload-panel";
import { InsightBanner } from "@/components/analytics/insight-banner";
import {
  createTimeEntry,
  getAnalytics,
  listProjects
} from "@/services/base-workspace.service";
import type { Analytics, Project } from "@/types/base";

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  function reload() {
    Promise.all([getAnalytics(), listProjects()])
      .then(([analyticsData, projectsData]) => {
        setAnalytics(analyticsData);
        setProjects(projectsData);
      })
      .catch((error) => {
        window.alert(
          error instanceof Error ? error.message : "Could not load analytics."
        );
      });
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleLogTime(input: LogTimeInput) {
    await createTimeEntry(input);
    reload();
  }

  if (!analytics) {
    return (
      <div className="p-8 text-sm text-[#8a90a3] dark:text-[#7d8299]">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-8">
      <AnalyticsHeader
        logTimeSlot={
          <LogTimePopover onLogTime={handleLogTime} projects={projects} />
        }
      />
      <StatCardsRow analytics={analytics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr_1fr]">
        <ProjectProgressPanel
          series={analytics.projectHoursSeries}
          xLabels={analytics.timeLoggedByDay.map((day) => day.label)}
        />
        <TaskStatusPanel breakdown={analytics.taskStatusBreakdown} />
        <TimeLoggedPanel timeLoggedByDay={analytics.timeLoggedByDay} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.6fr_1fr]">
        <TimeDistributionPanel timeDistribution={analytics.timeDistribution} />
        <ActivityHeatmapPanel heatmap={analytics.activityHeatmap} />
        <TopContributorsPanel contributors={analytics.topContributors} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <TopActiveProjectsPanel projects={analytics.topActiveProjects} />
          <InsightBanner analytics={analytics} />
        </div>
        <TeamWorkloadPanel workload={analytics.teamWorkload} />
      </div>
    </div>
  );
}
