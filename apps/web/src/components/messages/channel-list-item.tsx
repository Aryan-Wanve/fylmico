import { ChannelAvatar } from "@/components/messages/channel-avatar";
import type { Channel } from "@/components/messages/message-data";

export function ChannelListItem({
  channel,
  active,
  onSelect
}: {
  channel: Channel;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left ${
        active ? "bg-[#654cff]/[0.08]" : "hover:bg-black/[0.03]"
      }`}
      onClick={onSelect}
      type="button"
    >
      <ChannelAvatar channel={channel} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <strong
            className={`truncate text-sm font-bold ${active ? "text-[#654cff]" : "text-[#11142c]"}`}
          >
            {channel.name}
          </strong>
          <span className="shrink-0 text-xs text-[#8a90a3]">
            {channel.lastMessageTime}
          </span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-[#8a90a3]">
            {channel.lastMessagePreview}
          </span>
          {channel.unreadCount > 0 ? (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[#654cff] px-1 text-[0.68rem] font-bold text-white">
              {channel.unreadCount}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
