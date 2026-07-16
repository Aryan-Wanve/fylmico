"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import {
  FocusTaskCard,
  FocusTaskEmptyState
} from "@/components/dashboard/focus-task-card";
import { SubmitDraftDialog } from "@/components/dashboard/submit-draft-dialog";
import { MyTasksGroupsPanel } from "@/components/dashboard/my-tasks-groups-panel";
import { TodayTimelinePanel } from "@/components/dashboard/today-timeline-panel";
import { UpcomingDeadlinesPanel } from "@/components/dashboard/upcoming-deadlines-panel";
import { NotificationsPreviewPanel } from "@/components/dashboard/notifications-preview-panel";
import { TeamOnlinePanel } from "@/components/dashboard/team-online-panel";
import { PersonalStatsPanel } from "@/components/dashboard/personal-stats-panel";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { RecentProjectsPanel } from "@/components/dashboard/recent-projects-panel";
import { RecentActivityPanel } from "@/components/dashboard/recent-activity-panel";
import { FadeInSection } from "@/components/layout/fade-in-section";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import { PRIORITY_ORDER } from "@/components/tasks/task-data";
import { useWorkspace } from "@/lib/workspace-context";
import type { ProductionTask } from "@/types/base";

function pickFocusTask(
  tasks: ProductionTask[],
  userId: string
): ProductionTask | null {
  const myOpenTasks = tasks.filter(
    (task) =>
      task.assignees.some((assignee) => assignee.userId === userId) &&
      task.status !== "completed" &&
      task.status !== "archived"
  );

  function best(status: ProductionTask["status"]) {
    return myOpenTasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        const priorityDiff =
          PRIORITY_ORDER.indexOf(a.priority) -
          PRIORITY_ORDER.indexOf(b.priority);
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      })[0];
  }

  return best("in-progress") ?? best("todo") ?? null;
}

export function HomeDashboard() {
  const router = useRouter();
  const { workspace, activeHouse, refreshWorkspace } = useWorkspace();
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [submitDraftOpen, setSubmitDraftOpen] = useState(false);

  const focusTask = pickFocusTask(workspace.tasks, workspace.user.id);

  return (
    <div className="grid grid-cols-1 gap-6 p-8">
      <FadeInSection delay={0}>
        <GreetingHeader />
      </FadeInSection>

      <FadeInSection delay={0.05}>
        {focusTask ? (
          <FocusTaskCard
            currentUserId={workspace.user.id}
            onChanged={() => void refreshWorkspace()}
            onOpenDetail={() => setDetailTaskId(focusTask.id)}
            onSubmitDraft={() => setSubmitDraftOpen(true)}
            task={focusTask}
          />
        ) : (
          <FocusTaskEmptyState
            onBrowseProjects={() => router.push("/projects")}
          />
        )}
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="grid gap-6">
            <MyTasksGroupsPanel />
            <QuickActionsPanel />
          </div>
          <div className="grid gap-6">
            <UpcomingDeadlinesPanel excludeTaskId={focusTask?.id} />
            <TodayTimelinePanel />
            <NotificationsPreviewPanel />
            <TeamOnlinePanel />
          </div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <PersonalStatsPanel />
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
          <RecentProjectsPanel />
          <RecentActivityPanel />
        </div>
      </FadeInSection>

      {detailTaskId ? (
        <TaskDetailPanel
          currentUserId={workspace.user.id}
          members={activeHouse?.members ?? []}
          onChanged={() => void refreshWorkspace()}
          onOpenChange={(open) => {
            if (!open) setDetailTaskId(null);
          }}
          taskId={detailTaskId}
          tasks={workspace.tasks}
        />
      ) : null}

      {submitDraftOpen && focusTask ? (
        <SubmitDraftDialog
          nextVersion={focusTask.attachmentIds.length + 1}
          onOpenChange={setSubmitDraftOpen}
          onUploaded={() => void refreshWorkspace()}
          taskId={focusTask.id}
        />
      ) : null}
    </div>
  );
}
