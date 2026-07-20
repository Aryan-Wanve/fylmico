import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart } from "@/components/analytics/donut-chart";
import { CATEGORY_STYLES } from "@/components/bookings/bookings-data";
import type { Booking, ResourceCategory } from "@/types/base";

const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  studio: "#3b82f6",
  equipment: "#654cff",
  venue: "#16c784"
};

export function BookingsByTypePanel({ bookings }: { bookings: Booking[] }) {
  const total = bookings.length;
  const segments = (Object.keys(CATEGORY_STYLES) as ResourceCategory[])
    .map((category) => {
      const value = bookings.filter(
        (b) => b.resourceCategory === category
      ).length;
      return {
        label: CATEGORY_STYLES[category].label,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: CATEGORY_COLORS[category]
      };
    })
    .filter((segment) => segment.value > 0);

  return (
    <DashboardPanel title="Bookings by Type">
      <div className="grid gap-4 p-6">
        {total > 0 ? (
          <>
            <div className="flex justify-center">
              <DonutChart
                centerLabel={String(total)}
                centerSublabel="Total"
                segments={segments}
                total={total}
              />
            </div>
            <div className="grid gap-2.5">
              {segments.map((segment) => (
                <div className="flex items-center gap-2" key={segment.label}>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#3a3f57] dark:text-[#b4b8cc]">
                    {segment.label}
                  </span>
                  <span className="text-xs font-semibold text-[#667085] dark:text-[#878ca0]">
                    {segment.value} ({segment.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-[#667085] dark:text-[#878ca0]">
            No bookings yet.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
