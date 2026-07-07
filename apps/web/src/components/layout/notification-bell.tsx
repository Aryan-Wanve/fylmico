"use client";

import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { activities } from "@/components/dashboard/activity-data";

export function NotificationBell() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-[#4b5268] hover:bg-black/[0.03]"
            type="button"
          >
            <Bell className="h-[1.15rem] w-[1.15rem]" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
          </button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <strong className="text-sm font-bold text-[#12142b]">
          Notifications
        </strong>
        <div className="grid gap-1">
          {activities.slice(0, 3).map((activity) => (
            <div
              className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-black/[0.03]"
              key={activity.id}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#654cff]/10 text-xs font-bold text-[#654cff]">
                {activity.icon}
              </span>
              <p className="text-sm text-[#3a3f57]">
                <strong className="font-semibold">{activity.name}</strong>{" "}
                {activity.text}
              </p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
