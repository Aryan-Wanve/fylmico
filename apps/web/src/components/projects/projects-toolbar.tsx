"use client";

import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STATUS_LABELS,
  STATUS_ORDER
} from "@/components/projects/project-data";
import { ProjectsFiltersPopover } from "@/components/projects/projects-filters-popover";
import type { ProjectStatus } from "@/components/projects/project-data";

export type ProjectTab = "all" | ProjectStatus;
export type ViewMode = "grid" | "list";

export function ProjectsToolbar({
  activeTab,
  onTabChange,
  counts,
  viewMode,
  onViewModeChange,
  activeTypes,
  onToggleType
}: {
  activeTab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
  counts: Record<ProjectTab, number>;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeTypes: Set<string>;
  onToggleType: (type: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <Tabs
        className="max-w-full min-w-0 overflow-x-auto"
        onValueChange={(value) => onTabChange(value as ProjectTab)}
        value={activeTab}
      >
        <TabsList className="shrink-0" variant="default">
          <TabsTrigger className="group" value="all">
            All Projects
            <CountPill value={counts.all} />
          </TabsTrigger>
          {STATUS_ORDER.map((status) => (
            <TabsTrigger className="group" key={status} value={status}>
              {STATUS_LABELS[status]}
              <CountPill value={counts[status]} />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-black/[0.04] p-1 dark:bg-white/[0.06]">
          <button
            aria-pressed={viewMode === "grid"}
            className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold ${
              viewMode === "grid"
                ? "bg-white text-[#11142c] shadow-sm dark:bg-[#171a28] dark:text-[#f1f2f8]"
                : "text-[#8a90a3] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:text-[#c7cad9]"
            }`}
            onClick={() => onViewModeChange("grid")}
            type="button"
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
          <button
            aria-pressed={viewMode === "list"}
            className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold ${
              viewMode === "list"
                ? "bg-white text-[#11142c] shadow-sm dark:bg-[#171a28] dark:text-[#f1f2f8]"
                : "text-[#8a90a3] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:text-[#c7cad9]"
            }`}
            onClick={() => onViewModeChange("list")}
            type="button"
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>

        <ProjectsFiltersPopover
          activeTypes={activeTypes}
          onToggleType={onToggleType}
        />
      </div>
    </div>
  );
}

function CountPill({ value }: { value: number }) {
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/[0.06] px-1 text-xs font-bold text-[#4b5268] group-data-active:bg-[var(--fylmico-accent)]/10 group-data-active:text-[var(--fylmico-accent)] dark:bg-white/[0.08] dark:text-[#c7cad9]">
      {value}
    </span>
  );
}
