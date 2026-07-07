import { Info, MoreVertical, Phone, Video } from "lucide-react";
import { ChannelAvatar } from "@/components/messages/channel-avatar";
import type { Channel } from "@/components/messages/message-data";

export function ChatHeader({ channel }: { channel: Channel }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ChannelAvatar channel={channel} size="lg" />
        <div className="min-w-0">
          <strong className="block truncate text-base font-bold text-[#11142c]">
            {channel.name}
          </strong>
          {channel.kind === "group" ? (
            <span className="text-xs text-[#8a90a3]">
              {channel.memberIds.length} members
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          aria-label="Call"
          className="grid h-9 w-9 place-items-center rounded-full text-[#4b5268] hover:bg-black/[0.04]"
          type="button"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          aria-label="Video call"
          className="grid h-9 w-9 place-items-center rounded-full text-[#4b5268] hover:bg-black/[0.04]"
          type="button"
        >
          <Video className="h-4 w-4" />
        </button>
        <button
          aria-label="Channel info"
          className="grid h-9 w-9 place-items-center rounded-full text-[#4b5268] hover:bg-black/[0.04]"
          type="button"
        >
          <Info className="h-4 w-4" />
        </button>
        <button
          aria-label="More options"
          className="grid h-9 w-9 place-items-center rounded-full text-[#4b5268] hover:bg-black/[0.04]"
          type="button"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
