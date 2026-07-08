import { CalendarCheck2, CheckCircle2, Clock, Hourglass } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { bookingsStats } from "@/components/bookings/bookings-data";

const ICONS: Record<string, LucideIcon> = {
  total: CalendarCheck2,
  upcoming: Clock,
  confirmed: CheckCircle2,
  pending: Hourglass
};

export function BookingsStatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {bookingsStats.map((stat) => (
        <StatCard
          icon={ICONS[stat.id]}
          key={stat.id}
          note={stat.note}
          noteTone={stat.id === "total" ? "positive" : "default"}
          sparklinePoints={stat.sparklinePoints}
          title={stat.title}
          tone={stat.tone}
          value={stat.value}
        />
      ))}
    </div>
  );
}
