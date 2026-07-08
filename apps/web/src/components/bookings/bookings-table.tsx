import {
  Building2,
  Calendar,
  Camera,
  DoorOpen,
  MoreVertical
} from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import {
  CATEGORY_STYLES,
  STATUS_STYLES,
  type BookingRow,
  type ResourceCategory
} from "@/components/bookings/bookings-data";

const CATEGORY_ICONS: Record<ResourceCategory, typeof Building2> = {
  studio: Building2,
  equipment: Camera,
  venue: DoorOpen
};

export function BookingsTable({ rows }: { rows: BookingRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="px-6 py-12 text-center text-sm text-[#8a90a3]">
        No bookings match this filter.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[64rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-black/5 text-xs font-bold tracking-wide text-[#8a90a3]">
            <th className="px-6 py-3 font-bold">Booking</th>
            <th className="px-6 py-3 font-bold">Resource</th>
            <th className="px-6 py-3 font-bold">Project</th>
            <th className="px-6 py-3 font-bold">Dates</th>
            <th className="px-6 py-3 font-bold">Status</th>
            <th className="px-6 py-3 font-bold">Booked By</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const Icon = CATEGORY_ICONS[row.resourceCategory];
            const categoryStyle = CATEGORY_STYLES[row.resourceCategory];
            const statusStyle = STATUS_STYLES[row.status];

            return (
              <tr
                className="border-b border-black/5 align-middle last:border-b-0 hover:bg-black/[0.015]"
                key={row.id}
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${categoryStyle.icon}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold text-[#11142c]">
                        {row.resourceName}
                      </strong>
                      <span className="block truncate text-xs text-[#8a90a3]">
                        {row.resourceSubtitle}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#5f667d]">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold ${categoryStyle.tile}`}
                    >
                      {categoryStyle.label}
                    </span>
                    <span>• {row.resourceTag}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <strong className="block truncate text-sm font-semibold text-[#11142c]">
                    {row.projectName}
                  </strong>
                  <div className="flex items-center gap-1.5 text-xs text-[#8a90a3]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${categoryStyle.dot}`}
                    />
                    {row.projectPhase}
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#3a3f57]">
                    <Calendar className="h-3.5 w-3.5 text-[#8a90a3]" />
                    {row.dateRange}
                  </div>
                  <span className="text-xs text-[#8a90a3]">
                    {row.timeRange}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusStyle.className}`}
                  >
                    {statusStyle.label}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <AvatarWithStatus
                      label={row.bookedByName.charAt(0)}
                      size="sm"
                      userId={row.bookedByUserId}
                    />
                    <div className="min-w-0">
                      <strong className="block truncate text-xs font-semibold text-[#3a3f57]">
                        {row.bookedByName}
                      </strong>
                      <span className="block truncate text-[0.7rem] text-[#8a90a3]">
                        {row.bookedAgo}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    aria-label={`More actions for ${row.resourceName} booking`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04]"
                    type="button"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
