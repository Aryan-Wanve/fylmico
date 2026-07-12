import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  CATEGORY_STYLES,
  type CalendarEvent
} from "@/components/calendar/calendar-data";
import { isSameDay } from "@/lib/calendar-utils";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function UpcomingEventsPanel({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const rangeEnd = new Date(todayStart.getTime() + 7 * MS_PER_DAY);

  const upcoming = events
    .filter((event) => {
      const eventDate = new Date(`${event.date}T00:00:00`);

      return eventDate >= todayStart && eventDate < rangeEnd;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <DashboardPanel title="Upcoming (Next 7 Days)">
      {upcoming.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
          No events in the next 7 days.
        </p>
      ) : (
        <div className="grid grid-cols-1">
          {upcoming.map((event) => (
            <div
              className="flex items-start gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0 dark:border-white/[0.06]"
              key={event.id}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${CATEGORY_STYLES[event.category].dot}`}
              />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {event.title}
                </strong>
                <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  {formatRelativeDay(event.date, todayStart)}, {event.time}
                </span>
              </div>
              {event.location ? (
                <span className="shrink-0 rounded-md bg-black/[0.03] px-2 py-1 text-xs font-semibold text-[#5f667d] dark:bg-white/[0.05] dark:text-[#a8acbf]">
                  {event.location}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

function formatRelativeDay(isoDate: string, todayStart: Date): string {
  const eventDate = new Date(`${isoDate}T00:00:00`);

  if (isSameDay(eventDate, todayStart)) {
    return "Today";
  }

  const tomorrow = new Date(todayStart.getTime() + MS_PER_DAY);

  if (isSameDay(eventDate, tomorrow)) {
    return "Tomorrow";
  }

  return eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}
