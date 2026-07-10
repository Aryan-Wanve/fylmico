import { Sparkles } from "lucide-react";
import { formatHours } from "@/components/analytics/analytics-data";
import type { Analytics } from "@/types/base";

export function InsightBanner({ analytics }: { analytics: Analytics }) {
  const message =
    analytics.tasksTotal === 0 && analytics.hoursLoggedTotal === 0
      ? "Log time and complete tasks to see insights here."
      : `Your team has completed ${analytics.tasksCompleted} of ${analytics.tasksTotal} tasks (${analytics.teamEfficiency}%) and logged ${formatHours(analytics.hoursLoggedTotal)} across ${analytics.totalProjects} project${analytics.totalProjects === 1 ? "" : "s"}.`;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#654cff]/15 bg-[#654cff]/[0.06] px-5 py-4">
      <Sparkles className="h-5 w-5 shrink-0 text-[#654cff]" />
      <p className="text-sm font-semibold text-[#3a3f57]">{message}</p>
    </div>
  );
}
