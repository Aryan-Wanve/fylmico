"use client";

import { useState } from "react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { scheduleItems } from "@/components/dashboard/schedule-data";

const TONE_DOT: Record<"violet" | "blue", string> = {
  violet: "bg-[#654cff]",
  blue: "bg-[#3b82f6]"
};

export function UpcomingSchedulePanel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = scheduleItems[selectedIndex];

  return (
    <DashboardPanel
      action={{ label: "View Calendar" }}
      title="Upcoming Schedule"
    >
      <div className="grid">
        {scheduleItems.map((item, index) => (
          <button
            className={`grid grid-cols-[5rem_auto_1fr_auto] items-center gap-4 border-b border-black/5 px-6 py-3.5 text-left last:border-b-0 hover:bg-black/[0.02] ${
              index === selectedIndex ? "bg-[#654cff]/[0.04]" : ""
            }`}
            key={`${item.time}-${item.title}`}
            onClick={() => setSelectedIndex(index)}
            type="button"
          >
            <time className="text-sm font-semibold text-[#4b5268]">
              {item.time}
            </time>
            <span
              className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[item.tone]}`}
            />
            <div className="min-w-0">
              <strong className="block truncate text-sm font-semibold text-[#11142c]">
                {item.title}
              </strong>
              <span className="text-xs text-[#8a90a3]">
                Project: {item.project}
              </span>
            </div>
            <span className="text-xs font-medium text-[#8a90a3]">
              {item.place}
            </span>
          </button>
        ))}
      </div>
      {selected ? (
        <div className="m-4 rounded-xl bg-[#654cff]/[0.06] p-3.5">
          <strong className="block text-sm font-bold text-[#11142c]">
            {selected.title}
          </strong>
          <span className="text-xs font-medium text-[#5f667d]">
            {selected.time} at {selected.place}
          </span>
        </div>
      ) : null}
    </DashboardPanel>
  );
}
