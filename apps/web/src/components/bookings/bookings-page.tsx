"use client";

import { useState } from "react";
import { BookingsHeader } from "@/components/bookings/bookings-header";
import {
  BookingsTabsBar,
  type BookingsTab
} from "@/components/bookings/bookings-tabs-bar";
import { BookingsStatCards } from "@/components/bookings/bookings-stat-cards";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { BookingsPagination } from "@/components/bookings/bookings-pagination";
import { BookingsByTypePanel } from "@/components/bookings/bookings-by-type-panel";
import { UpcomingBookingsPanel } from "@/components/bookings/upcoming-bookings-panel";
import { BookingCalendarPanel } from "@/components/bookings/booking-calendar-panel";
import { bookingRows } from "@/components/bookings/bookings-data";

const CURRENT_USER_ID = "user-aryan";

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingsTab>("all");

  const filteredRows = bookingRows.filter((row) => {
    if (activeTab === "all") {
      return true;
    }

    if (activeTab === "mine") {
      return row.bookedByUserId === CURRENT_USER_ID;
    }

    return row.status === activeTab;
  });

  return (
    <div className="grid gap-6 p-8">
      <BookingsHeader />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 gap-6">
          <BookingsTabsBar activeTab={activeTab} onTabChange={setActiveTab} />
          <BookingsStatCards />

          <div className="min-w-0 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
            <BookingsTable rows={filteredRows} />
            <div className="border-t border-black/5">
              <BookingsPagination rowCount={filteredRows.length} />
            </div>
          </div>
        </div>

        <aside className="grid min-w-0 content-start gap-6">
          <BookingsByTypePanel />
          <UpcomingBookingsPanel />
          <BookingCalendarPanel />
        </aside>
      </div>
    </div>
  );
}
