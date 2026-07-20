import { DashboardPanel } from "@/components/dashboard/dashboard-panel";

function formatMinutes(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}h`;
}

export function TaskEstimatePanel({
  taskEstimateVsActual
}: {
  taskEstimateVsActual: { estimatedMinutes: number; actualMinutes: number };
}) {
  const { estimatedMinutes, actualMinutes } = taskEstimateVsActual;
  const total = Math.max(estimatedMinutes, actualMinutes) || 1;

  return (
    <DashboardPanel title="Estimate vs Actual">
      {estimatedMinutes === 0 && actualMinutes === 0 ? (
        <p className="py-10 text-center text-sm text-[#667085] dark:text-[#7d8299]">
          Add estimates and track time on tasks to see this comparison.
        </p>
      ) : (
        <div className="grid gap-4 p-6">
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Estimated
              </span>
              <span className="font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {formatMinutes(estimatedMinutes)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-[#3b82f6]"
                style={{ width: `${(estimatedMinutes / total) * 100}%` }}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Actual
              </span>
              <span className="font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {formatMinutes(actualMinutes)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-[#16c784]"
                style={{ width: `${(actualMinutes / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}
