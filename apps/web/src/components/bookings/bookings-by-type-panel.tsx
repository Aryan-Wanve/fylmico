import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DonutChart } from "@/components/analytics/donut-chart";
import {
  bookingsByType,
  bookingsByTypeTotal
} from "@/components/bookings/bookings-data";

export function BookingsByTypePanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Bookings by Type">
      <div className="grid gap-4 p-6">
        <div className="flex justify-center">
          <DonutChart
            centerLabel={String(bookingsByTypeTotal)}
            centerSublabel="Total"
            segments={bookingsByType}
            total={bookingsByTypeTotal}
          />
        </div>
        <div className="grid gap-2.5">
          {bookingsByType.map((segment) => (
            <div className="flex items-center gap-2" key={segment.label}>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#3a3f57]">
                {segment.label}
              </span>
              <span className="text-xs font-semibold text-[#8a90a3]">
                {segment.value} ({segment.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
