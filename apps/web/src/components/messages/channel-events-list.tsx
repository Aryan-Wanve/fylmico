import { CalendarDays } from "lucide-react";
import type { ChannelEvent } from "@/components/messages/message-data";

export function ChannelEventsList({ events }: { events: ChannelEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#8a90a3]">
        No events scheduled for this channel yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {events.map((event) => (
        <div
          className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3.5 py-2.5"
          key={event.id}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#654cff]/10 text-[#654cff]">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-semibold text-[#11142c]">
              {event.title}
            </strong>
            <span className="text-xs text-[#8a90a3]">
              {event.date} &bull; {event.time}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
