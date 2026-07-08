import { TrendingUp } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart } from "@/components/analytics/donut-chart";
import {
  taskStatusSegments,
  taskStatusTotal
} from "@/components/analytics/analytics-data";

export function TaskStatusPanel() {
  return (
    <DashboardPanel title="Task Status">
      <div className="grid gap-4 p-6">
        <div className="flex items-center gap-6">
          <DonutChart
            centerLabel={String(taskStatusTotal)}
            centerSublabel="Total Tasks"
            segments={taskStatusSegments}
            total={taskStatusTotal}
          />
          <div className="grid min-w-0 flex-1 gap-2.5">
            {taskStatusSegments.map((segment) => (
              <div className="flex items-center gap-2" key={segment.label}>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#3a3f57]">
                  {segment.label}
                </span>
                <span className="text-sm font-bold text-[#11142c]">
                  {segment.value}
                </span>
                <span className="text-xs font-semibold text-[#8a90a3]">
                  ({Math.round((segment.value / taskStatusTotal) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" />
          18% more completed tasks
        </div>
      </div>
    </DashboardPanel>
  );
}
