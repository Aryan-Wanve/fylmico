import {
  Building2,
  Clapperboard,
  CheckCircle2,
  Clock,
  FolderKanban,
  Users
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatHours } from "@/components/analytics/analytics-data";
import type { Analytics } from "@/types/base";

export function StatCardsRow({ analytics }: { analytics: Analytics }) {
  const cards = [
    {
      id: "total-projects",
      title: "Total Projects",
      value: String(analytics.totalProjects),
      note: `${analytics.activeProjects} active`,
      tone: "violet" as const,
      icon: FolderKanban
    },
    {
      id: "active-projects",
      title: "Active Projects",
      value: String(analytics.activeProjects),
      note: "Currently in progress",
      tone: "blue" as const,
      icon: Clapperboard
    },
    {
      id: "total-clients",
      title: "Clients",
      value: String(analytics.totalClients),
      note: "Companies you produce work for",
      tone: "green" as const,
      icon: Building2
    },
    {
      id: "tasks-completed",
      title: "Tasks Completed",
      value: String(analytics.tasksCompleted),
      note: `${analytics.tasksTotal} total tasks`,
      tone: "green" as const,
      icon: CheckCircle2
    },
    {
      id: "hours-logged",
      title: "Hours Logged",
      value: formatHours(analytics.hoursLoggedTotal),
      note: "All time",
      tone: "orange" as const,
      icon: Clock
    },
    {
      id: "team-efficiency",
      title: "Team Efficiency",
      value: `${analytics.teamEfficiency}%`,
      note: "Tasks completed rate",
      tone: "violet" as const,
      icon: Users
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <StatCard
          icon={card.icon}
          key={card.id}
          note={card.note}
          title={card.title}
          tone={card.tone}
          value={card.value}
        />
      ))}
    </div>
  );
}
