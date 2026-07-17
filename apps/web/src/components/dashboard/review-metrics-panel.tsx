"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getReviewMetrics } from "@/services/base-workspace.service";
import type { ReviewMetrics } from "@/types/base";

export function ReviewMetricsPanel() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReviewMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .catch(() => {
        if (!cancelled) setMetrics(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!metrics) {
    return null;
  }

  return (
    <div
      className="grid cursor-pointer grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      onClick={() => router.push("/review")}
      role="button"
      tabIndex={0}
    >
      <StatCard
        icon={Clock}
        note="Submissions in the queue"
        title="Waiting for Review"
        tone="orange"
        value={String(metrics.waitingForReview)}
      />
      <StatCard
        icon={RotateCcw}
        note="Sent back to editors"
        title="Changes Requested"
        tone="blue"
        value={String(metrics.changesRequested)}
      />
      <StatCard
        icon={CheckCircle2}
        note="Approved in the last 24h"
        title="Approved Today"
        tone="green"
        value={String(metrics.approvedToday)}
      />
      <StatCard
        icon={AlertTriangle}
        note="Past their due date"
        title="Overdue Reviews"
        tone="violet"
        value={String(metrics.overdueReviews)}
      />
    </div>
  );
}
