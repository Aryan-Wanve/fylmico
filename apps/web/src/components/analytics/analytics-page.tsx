import { AnalyticsHeader } from "@/components/analytics/analytics-header";
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

export function AnalyticsPage() {
  return (
    <div className="grid gap-6 p-8">
      <AnalyticsHeader />
      <StatCardsRow />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr_1fr]">
        <ProjectProgressPanel />
        <TaskStatusPanel />
        <TimeLoggedPanel />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.6fr_1fr]">
        <TimeDistributionPanel />
        <ActivityHeatmapPanel />
        <TopContributorsPanel />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <TopActiveProjectsPanel />
          <InsightBanner />
        </div>
        <TeamWorkloadPanel />
      </div>
    </div>
  );
}
