"use client";

import { Plus, Search } from "lucide-react";
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
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="grid gap-3 border-b border-black/5 p-3 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-black/10 px-2.5 dark:border-white/10">
            <Search className="h-4 w-4 shrink-0 text-[#667085] dark:text-[#878ca0]" />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#12142b] outline-none placeholder:text-[#9296a4] dark:text-[#f1f2f8] dark:placeholder:text-[#878ca0]"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search chats..."
              type="search"
              value={searchTerm}
            />
          </div>
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
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/[0.06] px-1 text-xs font-bold text-[#4b5268] group-data-active:bg-[var(--fylmico-accent)]/10 group-data-active:text-[var(--fylmico-accent)] dark:bg-white/[0.08] dark:text-[#c7cad9]">
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
            <strong className="px-1 text-xs font-bold tracking-wide text-[#667085] uppercase dark:text-[#878ca0]">
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
            <strong className="px-1 text-xs font-bold tracking-wide text-[#667085] uppercase dark:text-[#878ca0]">
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
          <p className="px-1 py-6 text-center text-sm text-[#667085] dark:text-[#878ca0]">
            No chats match your search.
          </p>
        ) : null}
      </div>

      <div className="border-t border-black/5 p-3 dark:border-white/[0.06]">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--fylmico-accent)] py-2.5 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
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
