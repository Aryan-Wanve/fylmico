import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  ListChecks
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount
} from "@/components/ui/avatar";
import { ChannelAvatar } from "@/components/messages/channel-avatar";
import { getInitials, type Channel } from "@/components/messages/message-data";
import type { ChatTab } from "@/components/messages/chat-tabs";
import type { HouseMember } from "@/types/base";

export function ChannelInfoPanel({
  channel,
  members,
  onRename,
  onSelectTab
}: {
  channel: Channel;
  members: HouseMember[];
  onRename: () => void;
  onSelectTab: (tab: ChatTab) => void;
}) {
  const visibleMembers = members.slice(0, 4);
  const overflow = members.length - visibleMembers.length;

  return (
    <div className="grid content-start gap-5 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center justify-between">
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          {channel.name}
        </strong>
        <button
          className="text-sm font-bold text-[#654cff]"
          onClick={onRename}
          type="button"
        >
          Edit
        </button>
      </div>

      <div className="grid justify-items-center gap-3 text-center">
        <ChannelAvatar channel={channel} size="lg" />
        <p className="text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          {channel.description}
        </p>
      </div>

      <div>
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Members ({members.length})
        </strong>
        <AvatarGroup className="mt-2">
          {visibleMembers.map((member) => (
            <Avatar key={member.id}>
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          ))}
          {overflow > 0 ? (
            <AvatarGroupCount>+{overflow}</AvatarGroupCount>
          ) : null}
        </AvatarGroup>
      </div>

      <div className="grid gap-1 border-t border-black/5 pt-4 dark:border-white/[0.06]">
        <div className="flex items-center justify-between py-1.5">
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
            <Bell className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
            Notifications
          </span>
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            All Messages
          </span>
        </div>
        <button
          className="flex items-center justify-between py-1.5"
          onClick={() => onSelectTab("files")}
          type="button"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
            <FileText className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
            Files
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#8a90a3] dark:text-[#7d8299]" />
        </button>
        <button
          className="flex items-center justify-between py-1.5"
          onClick={() => onSelectTab("tasks")}
          type="button"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
            <ListChecks className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
            Tasks
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#8a90a3] dark:text-[#7d8299]" />
        </button>
        <button
          className="flex items-center justify-between py-1.5"
          onClick={() => onSelectTab("events")}
          type="button"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
            <CalendarDays className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
            Events
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#8a90a3] dark:text-[#7d8299]" />
        </button>
      </div>
    </div>
  );
}
