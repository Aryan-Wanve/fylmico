"use client";

import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksFiltersPopover } from "@/components/tasks/tasks-filters-popover";
import {
  TasksGroupByMenu,
  type GroupByOption
} from "@/components/tasks/tasks-group-by-menu";
import type { TaskPriority } from "@/components/tasks/task-data";

export type TasksTab = "all" | "my-tasks" | "assigned-to-me" | "completed";

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
  onNewTask
}: {
  activeTab: TasksTab;
  onTabChange: (tab: TasksTab) => void;
  counts: Record<TasksTab, number>;
  groupBy: GroupByOption;
  onGroupByChange: (value: GroupByOption) => void;
  activePriorities: Set<TaskPriority>;
  onTogglePriority: (priority: TaskPriority) => void;
  onNewTask: () => void;
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
          activePriorities={activePriorities}
          onTogglePriority={onTogglePriority}
        />
        <TasksGroupByMenu onChange={onGroupByChange} value={groupBy} />
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
