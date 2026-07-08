"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabCounts } from "@/components/bookings/bookings-data";

export type BookingsTab =
  "all" | "mine" | "pending" | "confirmed" | "cancelled";

export function BookingsTabsBar({
  activeTab,
  onTabChange
}: {
  activeTab: BookingsTab;
  onTabChange: (tab: BookingsTab) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs
        onValueChange={(value) => onTabChange(value as BookingsTab)}
        value={activeTab}
      >
        <TabsList variant="line">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="mine">
            My Bookings
            <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[0.68rem] font-bold text-[#5f667d]">
              {tabCounts.myBookings}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approval
            <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[0.68rem] font-bold text-[#5f667d]">
              {tabCounts.pendingApproval}
            </span>
          </TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <button
          className="flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#654cff] to-[#5b3ff0] px-4 text-sm font-bold text-white hover:opacity-95"
          type="button"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </button>
        <button
          className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>
    </div>
  );
}
