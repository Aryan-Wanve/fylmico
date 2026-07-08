import {
  Clapperboard,
  CheckCircle2,
  Clock,
  FolderKanban,
  Users,
  type LucideIcon
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { statCards } from "@/components/analytics/analytics-data";

const ICONS: Record<string, LucideIcon> = {
  "total-projects": FolderKanban,
  "active-projects": Clapperboard,
  "tasks-completed": CheckCircle2,
  "hours-logged": Clock,
  "team-efficiency": Users
};

export function StatCardsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map((card) => (
        <div className="relative" key={card.id}>
          <StatCard
            icon={ICONS[card.id]}
            note={card.note}
            noteTone="positive"
            sparklinePoints={card.sparklinePoints}
            title={card.title}
            tone={card.tone}
            value={card.value}
          />
          {card.viewAll ? (
            <button
              className="absolute top-5 right-5 text-xs font-bold text-[#654cff]"
              type="button"
            >
              View all
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
