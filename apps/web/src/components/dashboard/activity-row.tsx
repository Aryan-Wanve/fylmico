import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import type { ActivityItem } from "@/components/dashboard/activity-data";

export function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <div className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0">
      <AvatarWithStatus
        label={activity.name.slice(0, 2).toUpperCase()}
        userId={activity.memberId}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#272c45]">
          <strong className="font-semibold">{activity.name}</strong>{" "}
          {activity.text}
        </p>
        <span className="text-xs text-[#8a90a3]">{activity.time}</span>
      </div>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#654cff]/[0.08] text-xs font-bold text-[#654cff]">
        {activity.icon}
      </span>
    </div>
  );
}
