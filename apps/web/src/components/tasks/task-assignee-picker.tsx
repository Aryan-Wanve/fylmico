"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toInitials } from "@/components/tasks/task-data";
import type {
  HouseMember,
  ProductionTask,
  TaskAssigneeInput
} from "@/types/base";

function isActive(task: ProductionTask): boolean {
  return task.status !== "completed" && task.status !== "archived";
}

export function TaskAssigneePicker({
  members,
  tasks,
  selected,
  onChange
}: {
  members: HouseMember[];
  tasks: ProductionTask[];
  selected: TaskAssigneeInput[];
  onChange: (next: TaskAssigneeInput[]) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = members.filter((member) =>
    member.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  function activeTaskCount(userId: string): number {
    return tasks.filter(
      (task) =>
        isActive(task) && task.assignees.some((a) => a.userId === userId)
    ).length;
  }

  function toggle(userId: string) {
    if (selected.some((a) => a.userId === userId)) {
      onChange(selected.filter((a) => a.userId !== userId));
    } else {
      onChange([...selected, { userId }]);
    }
  }

  function setResponsibility(userId: string, responsibility: string) {
    onChange(
      selected.map((a) => (a.userId === userId ? { ...a, responsibility } : a))
    );
  }

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#667085] dark:text-[#878ca0]" />
        <Input
          className="h-9 pl-8 text-sm"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search members..."
          value={search}
        />
      </div>
      <div className="grid max-h-64 gap-1.5 overflow-y-auto">
        {filtered.map((member) => {
          const assignment = selected.find((a) => a.userId === member.id);
          const isSelected = Boolean(assignment);

          return (
            <div
              className="grid gap-1.5 rounded-lg border border-black/[0.06] p-2 dark:border-white/[0.08]"
              key={member.id}
            >
              <button
                className="flex w-full items-center gap-2.5 text-left"
                onClick={() => toggle(member.id)}
                type="button"
              >
                <span className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--fylmico-accent)]/10 text-xs font-bold text-[var(--fylmico-accent)]">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small avatar thumbnail, not worth next/image's overhead here
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={member.avatarUrl}
                    />
                  ) : (
                    toInitials(member.name)
                  )}
                  <span
                    className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#171a28] ${
                      member.status === "online"
                        ? "bg-emerald-500"
                        : "bg-[#8a90a3]"
                    }`}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {member.name}
                  </span>
                  <span className="block text-xs text-[#667085] dark:text-[#878ca0]">
                    {member.role} · {activeTaskCount(member.id)} active
                  </span>
                </span>
                <input
                  checked={isSelected}
                  className="h-4 w-4 shrink-0 accent-[var(--fylmico-accent)]"
                  readOnly
                  type="checkbox"
                />
              </button>
              {isSelected ? (
                <input
                  className="h-8 rounded-md border border-black/10 bg-transparent px-2 text-xs outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c]"
                  onChange={(event) =>
                    setResponsibility(member.id, event.target.value)
                  }
                  placeholder="Responsibility (e.g. Lead Editor)"
                  value={assignment?.responsibility ?? ""}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
