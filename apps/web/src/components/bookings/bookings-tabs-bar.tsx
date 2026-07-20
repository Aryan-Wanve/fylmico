"use client";

import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type BookingsTab =
  "all" | "mine" | "pending" | "confirmed" | "cancelled";

export function BookingsTabsBar({
  activeTab,
  onTabChange,
  onNewBooking,
  tabCounts
}: {
  activeTab: BookingsTab;
  onTabChange: (tab: BookingsTab) => void;
  onNewBooking: () => void;
  tabCounts: { myBookings: number; pendingApproval: number };
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <Tabs
        className="max-w-full min-w-0 overflow-x-auto"
        onValueChange={(value) => onTabChange(value as BookingsTab)}
        value={activeTab}
      >
        <TabsList variant="line">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="mine">
            My Bookings
            <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[0.68rem] font-bold text-[#5f667d] dark:bg-white/[0.08] dark:text-[#a8acbf]">
              {tabCounts.myBookings}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approval
            <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[0.68rem] font-bold text-[#5f667d] dark:bg-white/[0.08] dark:text-[#a8acbf]">
              {tabCounts.pendingApproval}
            </span>
          </TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <button
          className="flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] px-4 text-sm font-bold text-white hover:opacity-95"
          onClick={onNewBooking}
          type="button"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </button>
      </div>
    </div>
  );
}
