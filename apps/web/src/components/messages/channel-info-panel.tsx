import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  ListChecks,
  Pin
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage
} from "@/components/ui/avatar";
import { ChannelAvatar } from "@/components/messages/channel-avatar";
import {
  MEMBER_AVATARS,
  MEMBER_NAMES,
  getInitials,
  type Channel
} from "@/components/messages/message-data";

export function ChannelInfoPanel({ channel }: { channel: Channel }) {
  const visibleMembers = channel.memberIds.slice(0, 4);
  const overflow = channel.memberIds.length - visibleMembers.length;

  return (
    <div className="grid content-start gap-5 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
      <div className="flex items-center justify-between">
        <strong className="text-sm font-bold text-[#11142c]">
          {channel.name}
        </strong>
        <button className="text-sm font-bold text-[#654cff]" type="button">
          Edit
        </button>
      </div>

      <div className="grid justify-items-center gap-3 text-center">
        <ChannelAvatar channel={channel} size="lg" />
        <p className="text-sm leading-relaxed text-[#5f667d]">
          {channel.description}
        </p>
      </div>

      {channel.kind === "group" ? (
        <div>
          <div className="flex items-center justify-between">
            <strong className="text-sm font-bold text-[#11142c]">
              Members ({channel.memberIds.length})
            </strong>
            <button className="text-sm font-bold text-[#654cff]" type="button">
              Add
            </button>
          </div>
          <AvatarGroup className="mt-2">
            {visibleMembers.map((memberId) => (
              <Avatar key={memberId}>
                {MEMBER_AVATARS[memberId] ? (
                  <AvatarImage alt="" src={MEMBER_AVATARS[memberId]} />
                ) : null}
                <AvatarFallback>{getInitials(memberId)}</AvatarFallback>
              </Avatar>
            ))}
            {overflow > 0 ? (
              <AvatarGroupCount>+{overflow}</AvatarGroupCount>
            ) : null}
          </AvatarGroup>
        </div>
      ) : (
        <div>
          <strong className="text-sm font-bold text-[#11142c]">About</strong>
          <p className="mt-1 text-sm text-[#5f667d]">
            {MEMBER_NAMES[channel.memberIds.find((id) => id !== "aryan") ?? ""]}
          </p>
        </div>
      )}

      <div className="grid gap-1 border-t border-black/5 pt-4">
        <div className="flex items-center justify-between py-1.5">
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57]">
            <Bell className="h-4 w-4 text-[#8a90a3]" />
            Notifications
          </span>
          <span className="text-xs font-semibold text-[#8a90a3]">
            All Messages
          </span>
        </div>
        <button
          className="flex items-center justify-between py-1.5"
          type="button"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57]">
            <Pin className="h-4 w-4 text-[#8a90a3]" />
            Pinned Messages
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#8a90a3]">
            3
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
        <button
          className="flex items-center justify-between py-1.5"
          type="button"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57]">
            <FileText className="h-4 w-4 text-[#8a90a3]" />
            Files
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#8a90a3]">
            {channel.files.length}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
        <button
          className="flex items-center justify-between py-1.5"
          type="button"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57]">
            <ListChecks className="h-4 w-4 text-[#8a90a3]" />
            Tasks
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#8a90a3]">
            {channel.tasks.length}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
        <button
          className="flex items-center justify-between py-1.5"
          type="button"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57]">
            <CalendarDays className="h-4 w-4 text-[#8a90a3]" />
            Events
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#8a90a3]">
            {channel.events.length}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>

      {channel.files.length > 0 ? (
        <div className="border-t border-black/5 pt-4">
          <div className="flex items-center justify-between">
            <strong className="text-sm font-bold text-[#11142c]">
              Shared Files
            </strong>
            <button className="text-sm font-bold text-[#654cff]" type="button">
              View all
            </button>
          </div>
          <div className="mt-2 grid gap-2">
            {channel.files.slice(0, 3).map((file) => (
              <div className="flex items-center gap-2.5" key={file.id}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-[#11142c]">
                    {file.name}
                  </strong>
                  <span className="text-xs text-[#8a90a3]">
                    {file.size} &bull;{" "}
                    {MEMBER_NAMES[file.authorId] ?? file.authorId} &bull;{" "}
                    {file.time}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
