"use client";

import { useMemo, useState } from "react";
import { MiniCalendar } from "@/components/calendar/mini-calendar";
import { addMonths } from "@/lib/calendar-utils";
import type { Booking } from "@/types/base";

function eachDateBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(startDate);
  const end = new Date(endDate);

  while (cursor <= end) {
    dates.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function BookingCalendarPanel({ bookings }: { bookings: Booking[] }) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const bookingDateSet = useMemo(() => {
    const dates = new Set<string>();
    for (const booking of bookings) {
      for (const date of eachDateBetween(booking.startDate, booking.endDate)) {
        dates.add(date);
      }
    }
    return dates;
  }, [bookings]);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between px-1">
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Booking Calendar
        </strong>
      </div>
      <MiniCalendar
        eventDateSet={bookingDateSet}
        onNextMonth={() => setVisibleMonth((month) => addMonths(month, 1))}
        onPrevMonth={() => setVisibleMonth((month) => addMonths(month, -1))}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        visibleMonth={visibleMonth}
      />
    </div>
  );
}
