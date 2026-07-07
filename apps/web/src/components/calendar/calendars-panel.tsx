import { MoreVertical, Plus } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Checkbox } from "@/components/ui/checkbox";
import { calendarSources } from "@/components/calendar/calendar-data";

export function CalendarsPanel({
  activeCalendarIds,
  onToggleCalendar
}: {
  activeCalendarIds: Set<string>;
  onToggleCalendar: (calendarId: string) => void;
}) {
  return (
    <DashboardPanel action={{ label: "Manage" }} title="Calendars">
      <div className="grid gap-0.5 p-2">
        {calendarSources.map((source) => (
          <div
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-black/[0.02]"
            key={source.id}
          >
            <Checkbox
              aria-label={`Toggle ${source.name} calendar`}
              checked={activeCalendarIds.has(source.id)}
              onCheckedChange={() => onToggleCalendar(source.id)}
            />
            <span className={`h-2.5 w-2.5 rounded-full ${source.color}`} />
            <span className="flex-1 truncate text-sm font-semibold text-[#3a3f57]">
              {source.name}
            </span>
            <MoreVertical className="h-4 w-4 text-[#c3c7d4]" />
          </div>
        ))}

        <button
          className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-[#654cff] hover:bg-black/[0.02]"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add Calendar
        </button>
      </div>
    </DashboardPanel>
  );
}
