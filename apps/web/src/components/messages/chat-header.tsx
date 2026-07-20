"use client";

import { MoreVertical, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChannelAvatar } from "@/components/messages/channel-avatar";
import type { Channel } from "@/components/messages/message-data";

export function ChatHeader({
  channel,
  onRename
}: {
  channel: Channel;
  onRename: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-3 dark:border-white/[0.06]">
      <div className="flex min-w-0 items-center gap-3">
        <ChannelAvatar channel={channel} size="lg" />
        <div className="min-w-0">
          <strong className="block truncate text-base font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {channel.name}
          </strong>
          {channel.kind === "group" ? (
            <span className="text-xs text-[#667085] dark:text-[#878ca0]">
              {channel.memberIds.length} members
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                aria-label="More options"
                className="grid h-9 w-9 place-items-center rounded-full text-[#4b5268] hover:bg-black/[0.04] dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
                type="button"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="h-4 w-4" />
              Rename channel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
