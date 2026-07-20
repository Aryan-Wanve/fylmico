import { Building2, Camera, DoorOpen } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { CATEGORY_STYLES } from "@/components/bookings/bookings-data";
import { toISODate } from "@/lib/calendar-utils";
import type { Booking, ResourceCategory } from "@/types/base";

const CATEGORY_ICONS: Record<ResourceCategory, typeof Building2> = {
  studio: Building2,
  equipment: Camera,
  venue: DoorOpen
};

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
];

export function UpcomingBookingsPanel({ bookings }: { bookings: Booking[] }) {
  const today = toISODate(new Date());
  const upcoming = bookings
    .filter((booking) => booking.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  return (
    <DashboardPanel title="Upcoming Bookings">
      <div className="grid gap-1 p-2">
        {upcoming.length > 0 ? (
          upcoming.map((booking) => {
            const Icon = CATEGORY_ICONS[booking.resourceCategory];
            const categoryStyle = CATEGORY_STYLES[booking.resourceCategory];
            const startDate = new Date(booking.startDate);

            return (
              <div
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                key={booking.id}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${categoryStyle.icon}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {booking.resourceName}
                  </strong>
                  <span className="block truncate text-xs text-[#667085] dark:text-[#7d8299]">
                    {booking.projectName ?? "No project"}
                  </span>
                </div>
                <div className="grid shrink-0 place-items-center rounded-lg bg-black/[0.03] px-2 py-1 text-center dark:bg-white/[0.05]">
                  <span className="text-[0.65rem] font-bold text-[#667085] dark:text-[#7d8299]">
                    {MONTH_LABELS[startDate.getMonth()]}
                  </span>
                  <span className="text-sm font-black text-[#11142c] dark:text-[#f1f2f8]">
                    {String(startDate.getDate()).padStart(2, "0")}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="px-4 py-6 text-center text-sm text-[#667085] dark:text-[#7d8299]">
            Nothing coming up.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
