"use client";

import { LayoutGrid, List, Plus, Table2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksFiltersPopover } from "@/components/tasks/tasks-filters-popover";
import {
  TasksGroupByMenu,
  type GroupByOption
} from "@/components/tasks/tasks-group-by-menu";
import type {
  HouseMember,
  OwnerType,
  TaskPriority,
  TaskStatus,
  TaskType
} from "@/types/base";

export type TasksTab = "all" | "my-tasks" | "assigned-to-me" | "completed";
export type TasksViewMode = "list" | "board" | "table";

const TABS: Array<{ value: TasksTab; label: string }> = [
  { value: "all", label: "All Tasks" },
  { value: "my-tasks", label: "My Tasks" },
  { value: "assigned-to-me", label: "Assigned to Me" },
  { value: "completed", label: "Completed" }
];

export function TasksToolbar({
  activeTab,
  onTabChange,
  counts,
  groupBy,
  onGroupByChange,
  activePriorities,
  onTogglePriority,
  activeStatuses,
  onToggleStatus,
  activeTypes,
  onToggleType,
  activeOwnerTypes,
  onToggleOwnerType,
  members,
  activeAssigneeIds,
  onToggleAssignee,
  onNewTask,
  viewMode,
  onViewModeChange
}: {
  activeTab: TasksTab;
  onTabChange: (tab: TasksTab) => void;
  counts: Record<TasksTab, number>;
  groupBy: GroupByOption;
  onGroupByChange: (value: GroupByOption) => void;
  activePriorities: Set<TaskPriority>;
  onTogglePriority: (priority: TaskPriority) => void;
  activeStatuses: Set<TaskStatus>;
  onToggleStatus: (status: TaskStatus) => void;
  activeTypes: Set<TaskType>;
  onToggleType: (type: TaskType) => void;
  activeOwnerTypes: Set<OwnerType | "none">;
  onToggleOwnerType: (value: OwnerType | "none") => void;
  members: HouseMember[];
  activeAssigneeIds: Set<string>;
  onToggleAssignee: (userId: string) => void;
  onNewTask: () => void;
  viewMode: TasksViewMode;
  onViewModeChange: (mode: TasksViewMode) => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <Tabs
        className="max-w-full min-w-0 overflow-x-auto"
        onValueChange={(value) => onTabChange(value as TasksTab)}
        value={activeTab}
      >
        <TabsList className="shrink-0" variant="default">
          {TABS.map((tab) => (
            <TabsTrigger className="group" key={tab.value} value={tab.value}>
              {tab.label}
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/[0.06] px-1 text-xs font-bold text-[#4b5268] group-data-active:bg-[#654cff]/10 group-data-active:text-[#654cff] dark:bg-white/[0.08] dark:text-[#c7cad9]">
                {counts[tab.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3">
        <TasksFiltersPopover
          activeAssigneeIds={activeAssigneeIds}
          activeOwnerTypes={activeOwnerTypes}
          activePriorities={activePriorities}
          activeStatuses={activeStatuses}
          activeTypes={activeTypes}
          members={members}
          onToggleAssignee={onToggleAssignee}
          onToggleOwnerType={onToggleOwnerType}
          onTogglePriority={onTogglePriority}
          onToggleStatus={onToggleStatus}
          onToggleType={onToggleType}
        />
        {viewMode === "list" ? (
          <TasksGroupByMenu onChange={onGroupByChange} value={groupBy} />
        ) : null}
        <div className="flex items-center gap-1 rounded-lg border border-black/10 p-1 dark:border-white/10">
          <button
            aria-label="List view"
            className={`grid h-7 w-7 place-items-center rounded-md ${
              viewMode === "list"
                ? "bg-[#654cff]/10 text-[#654cff]"
                : "text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
            }`}
            onClick={() => onViewModeChange("list")}
            type="button"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            aria-label="Board view"
            className={`grid h-7 w-7 place-items-center rounded-md ${
              viewMode === "board"
                ? "bg-[#654cff]/10 text-[#654cff]"
                : "text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
            }`}
            onClick={() => onViewModeChange("board")}
            type="button"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            aria-label="Table view"
            className={`grid h-7 w-7 place-items-center rounded-md ${
              viewMode === "table"
                ? "bg-[#654cff]/10 text-[#654cff]"
                : "text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
            }`}
            onClick={() => onViewModeChange("table")}
            type="button"
          >
            <Table2 className="h-4 w-4" />
          </button>
        </div>
        <button
          className="flex h-9 items-center gap-2 rounded-lg bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
          onClick={onNewTask}
          type="button"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>
    </div>
  );
}
