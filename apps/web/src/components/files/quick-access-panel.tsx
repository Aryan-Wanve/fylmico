import { ChevronRight, Clock, Link2, Star, Trash2 } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { quickAccess } from "@/components/files/file-data";

const ICONS: Record<string, typeof Star> = {
  starred: Star,
  "shared-links": Link2,
  offline: Clock,
  trash: Trash2
};

export function QuickAccessPanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Quick Access">
      <div className="grid gap-1 p-3">
        {quickAccess.map((entry) => {
          const Icon = ICONS[entry.id] ?? Star;

          return (
            <button
              className="flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.02]"
              key={entry.id}
              type="button"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#654cff]/[0.08] text-[#654cff]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-semibold text-[#3a3f57]">
                {entry.label}
              </span>
              <span className="text-sm font-bold text-[#11142c]">
                {entry.count}
              </span>
              <ChevronRight className="h-4 w-4 text-[#c3c7d4]" />
            </button>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
