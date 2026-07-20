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
import { TaskEstimatePanel } from "@/components/analytics/task-estimate-panel";
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
  const [rangeDays, setRangeDays] = useState(7);

  function reload(days: number) {
    Promise.all([getAnalytics(days), listProjects()])
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
    reload(rangeDays);
  }, [rangeDays]);

  async function handleLogTime(input: LogTimeInput) {
    await createTimeEntry(input);
    reload(rangeDays);
  }

  function handleExportCsv() {
    if (!analytics) {
      return;
    }

    const lines: string[] = [];
    lines.push("Summary");
    lines.push("Metric,Value");
    lines.push(`Total Projects,${analytics.totalProjects}`);
    lines.push(`Active Projects,${analytics.activeProjects}`);
    lines.push(`Tasks Total,${analytics.tasksTotal}`);
    lines.push(`Tasks Completed,${analytics.tasksCompleted}`);
    lines.push(`Hours Logged,${analytics.hoursLoggedTotal}`);
    lines.push(`Team Efficiency,${analytics.teamEfficiency}%`);
    lines.push("");
    lines.push("Time Logged By Day");
    lines.push("Date,Label,Hours");
    for (const day of analytics.timeLoggedByDay) {
      lines.push(`${day.date},${day.label},${day.hours}`);
    }
    lines.push("");
    lines.push("Top Contributors");
    lines.push("Name,Hours");
    for (const contributor of analytics.topContributors) {
      lines.push(`${contributor.name},${contributor.hours}`);
    }
    lines.push("");
    lines.push("Task Status Breakdown");
    lines.push("Status,Count");
    for (const status of analytics.taskStatusBreakdown) {
      lines.push(`${status.label},${status.count}`);
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fylmico-analytics-${rangeDays}d.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!analytics) {
    return (
      <div className="p-8 text-sm text-[#667085] dark:text-[#7d8299]">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <AnalyticsHeader
        logTimeSlot={
          <LogTimePopover onLogTime={handleLogTime} projects={projects} />
        }
        onExportCsv={handleExportCsv}
        onRangeChange={setRangeDays}
        rangeDays={rangeDays}
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

      <TaskEstimatePanel
        taskEstimateVsActual={analytics.taskEstimateVsActual}
      />

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
