import { Building2, Camera, DoorOpen } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  CATEGORY_STYLES,
  upcomingBookings,
  type ResourceCategory
} from "@/components/bookings/bookings-data";

const CATEGORY_ICONS: Record<ResourceCategory, typeof Building2> = {
  studio: Building2,
  equipment: Camera,
  venue: DoorOpen
};

export function UpcomingBookingsPanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Upcoming Bookings">
      <div className="grid gap-1 p-2">
        {upcomingBookings.map((booking) => {
          const Icon = CATEGORY_ICONS[booking.resourceCategory];
          const categoryStyle = CATEGORY_STYLES[booking.resourceCategory];

          return (
            <div
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[0.02]"
              key={booking.id}
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${categoryStyle.icon}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-[#11142c]">
                  {booking.resourceName}
                </strong>
                <span className="block truncate text-xs text-[#8a90a3]">
                  {booking.projectName}
                </span>
              </div>
              <div className="grid shrink-0 place-items-center rounded-lg bg-black/[0.03] px-2 py-1 text-center">
                <span className="text-[0.65rem] font-bold text-[#8a90a3]">
                  {booking.month}
                </span>
                <span className="text-sm font-black text-[#11142c]">
                  {booking.day}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
