"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  DEPARTMENT_META,
  DEPARTMENT_ORDER,
  type CrewMember
} from "@/components/crews/crew-data";

const COLLAPSED_COUNT = 5;

export function DepartmentOverviewPanel({
  members
}: {
  members: CrewMember[];
}) {
  const [expanded, setExpanded] = useState(false);

  const rows = DEPARTMENT_ORDER.map((department) => ({
    department,
    count: members.filter((member) => member.department === department).length
  })).filter((row) => row.count > 0);

  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_COUNT);

  return (
    <DashboardPanel action={{ label: "View all" }} title="Department Overview">
      <div className="grid gap-1 p-3">
        {visibleRows.map(({ department, count }) => {
          const meta = DEPARTMENT_META[department];
          const Icon = meta.icon;

          return (
            <div
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-black/[0.02]"
              key={department}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.bg} ${meta.color}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-semibold text-[#3a3f57]">
                {department} Department
              </span>
              <span className="text-sm font-bold text-[#11142c]">{count}</span>
            </div>
          );
        })}

        {rows.length > COLLAPSED_COUNT ? (
          <button
            className="mt-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-sm font-bold text-[#654cff] hover:bg-black/[0.02]"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? "Show less" : "Show more"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        ) : null}
      </div>
    </DashboardPanel>
  );
}
