"use client";

import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CrewsDepartmentMenu
} from "@/components/crews/crews-department-menu";
import type { Department } from "@/components/crews/crew-data";

export type CrewsTab =
  | "all"
  | "available"
  | "on-set"
  | "unavailable"
  | "groups";

const TABS: Array<{ value: CrewsTab; label: string }> = [
  { value: "all", label: "All Members" },
  { value: "available", label: "Available" },
  { value: "on-set", label: "On Set" },
  { value: "unavailable", label: "Unavailable" },
  { value: "groups", label: "Groups" }
];

export function CrewsToolbar({
  activeTab,
  onTabChange,
  counts,
  searchTerm,
  onSearchChange,
  department,
  onDepartmentChange
}: {
  activeTab: CrewsTab;
  onTabChange: (tab: CrewsTab) => void;
  counts: Record<CrewsTab, number>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  department: Department | "all";
  onDepartmentChange: (value: Department | "all") => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs
        className="min-w-0 max-w-full overflow-x-auto"
        onValueChange={(value) => onTabChange(value as CrewsTab)}
        value={activeTab}
      >
        <TabsList className="shrink-0" variant="default">
          {TABS.map((tab) => (
            <TabsTrigger className="group" key={tab.value} value={tab.value}>
              {tab.label}
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/[0.06] px-1 text-xs font-bold text-[#4b5268] group-data-active:bg-[#654cff]/10 group-data-active:text-[#654cff]">
                {counts[tab.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5">
          <Search className="h-4 w-4 text-[#8a90a3]" />
          <input
            className="h-full w-48 bg-transparent text-sm text-[#12142b] outline-none placeholder:text-[#9296a4]"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search crew members..."
            type="search"
            value={searchTerm}
          />
        </div>
        <CrewsDepartmentMenu onChange={onDepartmentChange} value={department} />
      </div>
    </div>
  );
}
