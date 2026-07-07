"use client";

import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelListItem } from "@/components/messages/channel-list-item";
import type { Channel } from "@/components/messages/message-data";

export type ChannelsFilter = "all" | "unread" | "groups";

export function ChannelsSidebar({
  pinnedChannels,
  recentChannels,
  activeChannelId,
  onSelectChannel,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  unreadCount,
  onNewChat
}: {
  pinnedChannels: Channel[];
  recentChannels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: ChannelsFilter;
  onFilterChange: (filter: ChannelsFilter) => void;
  unreadCount: number;
  onNewChat: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
      <div className="grid gap-3 border-b border-black/5 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-black/10 px-2.5">
            <Search className="h-4 w-4 shrink-0 text-[#8a90a3]" />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#12142b] outline-none placeholder:text-[#9296a4]"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search chats..."
              type="search"
              value={searchTerm}
            />
          </div>
          <button
            aria-label="Filter chats"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-black/10 text-[#4b5268] hover:bg-black/[0.03]"
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <Tabs
          onValueChange={(value) => onFilterChange(value as ChannelsFilter)}
          value={filter}
        >
          <TabsList variant="default">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger className="group" value="unread">
              Unread
              {unreadCount > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/[0.06] px-1 text-xs font-bold text-[#4b5268] group-data-active:bg-[#654cff]/10 group-data-active:text-[#654cff]">
                  {unreadCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {pinnedChannels.length > 0 ? (
          <div className="mb-3">
            <strong className="px-1 text-xs font-bold tracking-wide text-[#8a90a3] uppercase">
              Pinned
            </strong>
            <div className="mt-1 grid gap-0.5">
              {pinnedChannels.map((channel) => (
                <ChannelListItem
                  active={channel.id === activeChannelId}
                  channel={channel}
                  key={channel.id}
                  onSelect={() => onSelectChannel(channel.id)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {recentChannels.length > 0 ? (
          <div>
            <strong className="px-1 text-xs font-bold tracking-wide text-[#8a90a3] uppercase">
              Recent
            </strong>
            <div className="mt-1 grid gap-0.5">
              {recentChannels.map((channel) => (
                <ChannelListItem
                  active={channel.id === activeChannelId}
                  channel={channel}
                  key={channel.id}
                  onSelect={() => onSelectChannel(channel.id)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {pinnedChannels.length === 0 && recentChannels.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-[#8a90a3]">
            No chats match your search.
          </p>
        ) : null}
      </div>

      <div className="border-t border-black/5 p-3">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#654cff] py-2.5 text-sm font-bold text-white hover:bg-[#5a41ea]"
          onClick={onNewChat}
          type="button"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>
    </div>
  );
}
