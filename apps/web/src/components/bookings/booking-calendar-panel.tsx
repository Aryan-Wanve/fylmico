"use client";

import { useState } from "react";
import { MiniCalendar } from "@/components/calendar/mini-calendar";
import { addMonths } from "@/lib/calendar-utils";

const BOOKING_DATES = new Set([
  "2026-07-05",
  "2026-07-07",
  "2026-07-08",
  "2026-07-10",
  "2026-07-12",
  "2026-07-14",
  "2026-07-16",
  "2026-07-18"
]);

export function BookingCalendarPanel() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 6, 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 6, 10));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between px-1">
        <strong className="text-sm font-bold text-[#11142c]">
          Booking Calendar
        </strong>
        <button className="text-xs font-bold text-[#654cff]" type="button">
          View calendar
        </button>
      </div>
      <MiniCalendar
        eventDateSet={BOOKING_DATES}
        onNextMonth={() => setVisibleMonth((month) => addMonths(month, 1))}
        onPrevMonth={() => setVisibleMonth((month) => addMonths(month, -1))}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        visibleMonth={visibleMonth}
      />
    </div>
  );
}
