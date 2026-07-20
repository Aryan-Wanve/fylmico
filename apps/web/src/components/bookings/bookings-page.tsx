"use client";

import { useEffect, useMemo, useState } from "react";
import { BookingsHeader } from "@/components/bookings/bookings-header";
import {
  BookingsTabsBar,
  type BookingsTab
} from "@/components/bookings/bookings-tabs-bar";
import { BookingsStatCards } from "@/components/bookings/bookings-stat-cards";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { BookingsByTypePanel } from "@/components/bookings/bookings-by-type-panel";
import { UpcomingBookingsPanel } from "@/components/bookings/upcoming-bookings-panel";
import { BookingCalendarPanel } from "@/components/bookings/booking-calendar-panel";
import { NewBookingDialog } from "@/components/bookings/new-booking-dialog";
import { useWorkspace } from "@/lib/workspace-context";
import {
  createBooking,
  listBookings,
  listProjects,
  updateBookingStatus
} from "@/services/base-workspace.service";
import type {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  Project
} from "@/types/base";

export function BookingsPage() {
  const { activeHouse, workspace } = useWorkspace();
  const isOwner =
    activeHouse?.members.find((member) => member.id === workspace.user.id)
      ?.role === "Owner";
  const [activeTab, setActiveTab] = useState<BookingsTab>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([listBookings(), listProjects()])
      .then(([bookingData, projectData]) => {
        if (!cancelled) {
          setBookings(bookingData);
          setProjects(projectData);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error ? error.message : "Could not load bookings."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = bookings.filter((booking) => {
    if (activeTab === "all") {
      return true;
    }
    if (activeTab === "mine") {
      return booking.bookedById === workspace.user.id;
    }
    return booking.status === activeTab;
  });

  const tabCounts = useMemo(
    () => ({
      myBookings: bookings.filter((b) => b.bookedById === workspace.user.id)
        .length,
      pendingApproval: bookings.filter((b) => b.status === "pending").length
    }),
    [bookings, workspace.user.id]
  );

  async function handleCreateBooking(request: CreateBookingRequest) {
    const booking = await createBooking(request);
    setBookings((current) => [booking, ...current]);
  }

  async function handleUpdateStatus(bookingId: string, status: BookingStatus) {
    try {
      const updated = await updateBookingStatus(bookingId, status);
      setBookings((current) =>
        current.map((booking) => (booking.id === bookingId ? updated : booking))
      );
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update the booking."
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <BookingsHeader />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 grid-cols-1 gap-6">
          <BookingsTabsBar
            activeTab={activeTab}
            onNewBooking={() => setNewBookingOpen(true)}
            onTabChange={setActiveTab}
            tabCounts={tabCounts}
          />
          <BookingsStatCards bookings={bookings} />

          <div className="min-w-0 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {loading ? (
              <p className="px-6 py-12 text-center text-sm text-[#667085] dark:text-[#7d8299]">
                Loading bookings...
              </p>
            ) : (
              <BookingsTable
                isOwner={isOwner}
                onUpdateStatus={handleUpdateStatus}
                rows={filteredRows}
              />
            )}
            <div className="flex items-center justify-between border-t border-black/5 px-6 py-4 dark:border-white/[0.06]">
              <span className="text-sm font-medium text-[#667085] dark:text-[#7d8299]">
                Showing{" "}
                <span className="font-bold text-[#3a3f57] dark:text-[#b4b8cc]">
                  {filteredRows.length}
                </span>{" "}
                booking{filteredRows.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <aside className="grid min-w-0 grid-cols-1 content-start gap-6">
          <BookingsByTypePanel bookings={bookings} />
          <UpcomingBookingsPanel bookings={bookings} />
          <BookingCalendarPanel bookings={bookings} />
        </aside>
      </div>

      <NewBookingDialog
        onCreate={handleCreateBooking}
        onOpenChange={setNewBookingOpen}
        open={newBookingOpen}
        projects={projects}
      />
    </div>
  );
}
