"use client";

import { ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/types/base";

export type StoryboardTab =
  "boards" | "shots" | "characters" | "locations" | "templates";

const TABS: Array<{ value: StoryboardTab; label: string }> = [
  { value: "boards", label: "Boards" },
  { value: "shots", label: "Shots" },
  { value: "characters", label: "Characters" },
  { value: "locations", label: "Locations" },
  { value: "templates", label: "Templates" }
];

const NO_PROJECT_VALUE = "__none__";

export function StoryboardToolbar({
  projects,
  projectId,
  onProjectChange,
  activeTab,
  onTabChange,
  density,
  onDensityChange,
  onNewBoard
}: {
  projects: Project[];
  projectId: string | null;
  onProjectChange: (projectId: string | null) => void;
  activeTab: StoryboardTab;
  onTabChange: (tab: StoryboardTab) => void;
  density: "compact" | "comfortable";
  onDensityChange: (density: "compact" | "comfortable") => void;
  onNewBoard: () => void;
}) {
  const activeProjectTitle =
    projects.find((project) => project.id === projectId)?.title ??
    "All Projects";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-bold text-[#11142c] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#f1f2f8] dark:hover:bg-white/[0.05]"
                type="button"
              >
                <span className="h-2 w-2 rounded-full bg-[#654cff]" />
                {activeProjectTitle}
                <ChevronDown className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuRadioGroup
              onValueChange={(value) =>
                onProjectChange(value === NO_PROJECT_VALUE ? null : value)
              }
              value={projectId ?? NO_PROJECT_VALUE}
            >
              <DropdownMenuRadioItem value={NO_PROJECT_VALUE}>
                All Projects
              </DropdownMenuRadioItem>
              {projects.map((project) => (
                <DropdownMenuRadioItem key={project.id} value={project.id}>
                  {project.title}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tabs
          className="max-w-full min-w-0 overflow-x-auto"
          onValueChange={(value) => onTabChange(value as StoryboardTab)}
          value={activeTab}
        >
          <TabsList variant="line">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
                type="button"
              >
                View
                <ChevronDown className="h-4 w-4" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuRadioGroup
              onValueChange={(value) =>
                onDensityChange(value as "compact" | "comfortable")
              }
              value={density}
            >
              <DropdownMenuRadioItem value="comfortable">
                Comfortable
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="compact">
                Compact
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          className="flex h-9 items-center gap-2 rounded-lg bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
          onClick={onNewBoard}
          type="button"
        >
          <Plus className="h-4 w-4" />
          New Board
        </button>
      </div>
    </div>
  );
}
