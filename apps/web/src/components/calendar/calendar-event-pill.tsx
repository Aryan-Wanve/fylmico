import {
  CATEGORY_STYLES,
  type CalendarEvent
} from "@/components/calendar/calendar-data";

export function CalendarEventPill({ event }: { event: CalendarEvent }) {
  const styles = CATEGORY_STYLES[event.category];

  return (
    <div
      className={`w-full truncate rounded-md px-2 py-1 text-left text-xs ${styles.chip}`}
    >
      <strong className="block truncate font-bold">{event.title}</strong>
      <span className="block truncate font-medium opacity-80">
        {event.time}
        {event.location ? ` · ${event.location}` : ""}
      </span>
    </div>
  );
}
