import { CalendarDays } from "lucide-react";
import type { CalendarEvent } from "@/types/base";

export function ChannelEventsList({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
        No events scheduled for this channel yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {events.map((event) => (
        <div
          className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-[#171a28]"
          key={event.id}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
              {event.title}
            </strong>
            <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
              {event.date} &bull; {event.time}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
