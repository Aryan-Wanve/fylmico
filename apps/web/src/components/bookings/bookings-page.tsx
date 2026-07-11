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
import { useWorkspace } from "@/lib/workspace-context";
import {
  createBooking,
  listBookings,
  listProjects
} from "@/services/base-workspace.service";
import { toISODate } from "@/lib/calendar-utils";
import type { Booking, Project, ResourceCategory } from "@/types/base";

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "studio",
  "equipment",
  "venue"
];

export function BookingsPage() {
  const { workspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<BookingsTab>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function handleNewBooking() {
    const resourceName = window.prompt("Name the resource you're booking");
    if (!resourceName || !resourceName.trim()) {
      return;
    }

    const categoryInput = window.prompt(
      "Resource category - studio, equipment, or venue",
      "equipment"
    );
    const resourceCategory = RESOURCE_CATEGORIES.includes(
      categoryInput as ResourceCategory
    )
      ? (categoryInput as ResourceCategory)
      : "equipment";

    const projectTitle = window.prompt(
      "Project this booking is for (leave blank for none)",
      ""
    );
    const matchedProject = projectTitle?.trim()
      ? projects.find(
          (project) =>
            project.title.toLowerCase() === projectTitle.trim().toLowerCase()
        )
      : undefined;

    const today = toISODate(new Date());
    const startDate = window.prompt("Start date (YYYY-MM-DD)", today);
    if (!startDate) {
      return;
    }
    const endDate = window.prompt("End date (YYYY-MM-DD)", startDate);
    if (!endDate) {
      return;
    }

    try {
      const booking = await createBooking({
        resourceName: resourceName.trim(),
        resourceCategory,
        projectId: matchedProject?.id,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        startTime: "09:00 AM",
        endTime: "06:00 PM"
      });
      setBookings((current) => [booking, ...current]);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the booking."
      );
    }
  }

  return (
    <div className="grid gap-6 p-8">
      <BookingsHeader />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 gap-6">
          <BookingsTabsBar
            activeTab={activeTab}
            onNewBooking={handleNewBooking}
            onTabChange={setActiveTab}
            tabCounts={tabCounts}
          />
          <BookingsStatCards bookings={bookings} />

          <div className="min-w-0 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
            {loading ? (
              <p className="px-6 py-12 text-center text-sm text-[#8a90a3]">
                Loading bookings...
              </p>
            ) : (
              <BookingsTable rows={filteredRows} />
            )}
            <div className="flex items-center justify-between border-t border-black/5 px-6 py-4">
              <span className="text-sm font-medium text-[#8a90a3]">
                Showing{" "}
                <span className="font-bold text-[#3a3f57]">
                  {filteredRows.length}
                </span>{" "}
                booking{filteredRows.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <aside className="grid min-w-0 content-start gap-6">
          <BookingsByTypePanel bookings={bookings} />
          <UpcomingBookingsPanel bookings={bookings} />
          <BookingCalendarPanel bookings={bookings} />
        </aside>
      </div>
    </div>
  );
}
