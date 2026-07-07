import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MEMBER_AVATARS,
  MEMBER_NAMES,
  recentFileActivity
} from "@/components/files/file-data";

export function RecentFileActivityPanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Recent Activity">
      <div className="grid">
        {recentFileActivity.map((activity) => {
          const memberName = MEMBER_NAMES[activity.memberId] ?? activity.memberId;
          const memberAvatar = MEMBER_AVATARS[activity.memberId];

          return (
            <div
              className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0"
              key={activity.id}
            >
              <Avatar>
                {memberAvatar ? (
                  <AvatarImage alt="" src={memberAvatar} />
                ) : null}
                <AvatarFallback>
                  {memberName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[#272c45]">
                  <strong className="font-semibold">{memberName}</strong>{" "}
                  {activity.text}
                </p>
                <span className="text-xs text-[#8a90a3]">{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
