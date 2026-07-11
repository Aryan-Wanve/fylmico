import { CalendarCheck2, CheckCircle2, Clock, Hourglass } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { toISODate } from "@/lib/calendar-utils";
import type { Booking } from "@/types/base";

function buildLast7DayKeys(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return toISODate(date);
  });
}

export function BookingsStatCards({ bookings }: { bookings: Booking[] }) {
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  const now = new Date();
  const today = toISODate(now);
  const in30Days = toISODate(new Date(now.getTime() + 30 * 86400000));
  const upcoming = bookings.filter(
    (b) => b.startDate >= today && b.startDate <= in30Days
  ).length;

  const last7DayKeys = buildLast7DayKeys();
  const totalSparkline = last7DayKeys.map(
    (dayKey) =>
      bookings.filter((b) => toISODate(new Date(b.createdAt)) <= dayKey).length
  );

  const confirmedPercentage =
    total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={CalendarCheck2}
        note={`${total} total`}
        noteTone="positive"
        sparklinePoints={totalSparkline}
        title="Total Bookings"
        tone="violet"
        value={String(total)}
      />
      <StatCard
        icon={Clock}
        note="Next 30 days"
        title="Upcoming"
        tone="blue"
        value={String(upcoming)}
      />
      <StatCard
        icon={CheckCircle2}
        note={`${confirmedPercentage}% of total`}
        title="Confirmed"
        tone="green"
        value={String(confirmed)}
      />
      <StatCard
        icon={Hourglass}
        note="Needs action"
        title="Pending Approval"
        tone="orange"
        value={String(pending)}
      />
    </div>
  );
}
