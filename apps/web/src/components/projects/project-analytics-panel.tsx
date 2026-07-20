"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock,
  FileStack,
  Gauge,
  HardDrive,
  RefreshCw,
  Timer,
  Upload,
  Users
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatFileSize } from "@/components/files/file-data";
import { getProjectAnalytics } from "@/services/base-workspace.service";
import type { ProjectAnalytics } from "@/types/base";

export function ProjectAnalyticsPanel({ projectId }: { projectId: string }) {
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProjectAnalytics(projectId)
      .then((data) => {
        if (!cancelled) setAnalytics(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!analytics) {
    return (
      <p className="p-6 text-center text-sm text-[#667085] dark:text-[#7d8299]">
        Loading analytics...
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        icon={Camera}
        note="archived shoots"
        title="Shoots Completed"
        tone="violet"
        value={String(analytics.shootsCompleted)}
      />
      <StatCard
        icon={CheckCircle2}
        note="scheduled ahead"
        title="Shoots Upcoming"
        tone="blue"
        value={String(analytics.shootsUpcoming)}
      />
      <StatCard
        icon={Clock}
        note="logged by editors"
        title="Editing Hours"
        tone="blue"
        value={String(analytics.editingHours)}
      />
      <StatCard
        icon={Users}
        note="logged by the team"
        title="Team Hours"
        tone="green"
        value={String(analytics.teamHours)}
      />
      <StatCard
        icon={HardDrive}
        note={`${analytics.filesUploaded} files`}
        title="Storage Used"
        tone="orange"
        value={formatFileSize(analytics.storageBytes)}
      />
      <StatCard
        icon={FileStack}
        note="versions submitted"
        title="Deliverables"
        tone="violet"
        value={String(analytics.deliverableCount)}
      />
      <StatCard
        icon={Timer}
        note="draft to decision"
        title="Avg Review Time"
        tone="blue"
        value={
          analytics.avgReviewHours > 0 ? `${analytics.avgReviewHours}h` : "N/A"
        }
      />
      <StatCard
        icon={RefreshCw}
        note="deliverables in revision"
        title="Revision Count"
        tone="green"
        value={String(analytics.revisionCount)}
      />
      <StatCard
        icon={Gauge}
        note="project progress"
        title="Completion"
        tone="orange"
        value={`${analytics.completionPercent}%`}
      />
      <StatCard
        icon={Upload}
        note="under this project's folder"
        title="Files Uploaded"
        tone="violet"
        value={String(analytics.filesUploaded)}
      />
    </div>
  );
}
