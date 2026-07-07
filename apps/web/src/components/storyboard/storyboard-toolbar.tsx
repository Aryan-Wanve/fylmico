"use client";

import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type StoryboardTab =
  "boards" | "shots" | "characters" | "locations" | "templates";

const TABS: Array<{ value: StoryboardTab; label: string }> = [
  { value: "boards", label: "Boards" },
  { value: "shots", label: "Shots" },
  { value: "characters", label: "Characters" },
  { value: "locations", label: "Locations" },
  { value: "templates", label: "Templates" }
];

const PROJECTS = ["Beyond Frames", "Wanderers", "Lumee Ad Campaign", "Echoes"];

export function StoryboardToolbar({
  project,
  onProjectChange,
  activeTab,
  onTabChange,
  density,
  onDensityChange,
  onNewBoard
}: {
  project: string;
  onProjectChange: (project: string) => void;
  activeTab: StoryboardTab;
  onTabChange: (tab: StoryboardTab) => void;
  density: "compact" | "comfortable";
  onDensityChange: (density: "compact" | "comfortable") => void;
  onNewBoard: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-bold text-[#11142c] hover:bg-black/[0.03]"
                type="button"
              >
                <span className="h-2 w-2 rounded-full bg-[#654cff]" />
                {project}
                <ChevronDown className="h-4 w-4 text-[#8a90a3]" />
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuRadioGroup
              onValueChange={onProjectChange}
              value={project}
            >
              {PROJECTS.map((name) => (
                <DropdownMenuRadioItem key={name} value={name}>
                  {name}
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
                className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                aria-label="More options"
                className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-[#4b5268] hover:bg-black/[0.03]"
                type="button"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>Export board</DropdownMenuItem>
            <DropdownMenuItem>Duplicate board</DropdownMenuItem>
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
