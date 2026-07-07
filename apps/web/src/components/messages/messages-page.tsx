"use client";

import { useState } from "react";
import {
  ChannelsSidebar,
  type ChannelsFilter
} from "@/components/messages/channels-sidebar";
import { ChatHeader } from "@/components/messages/chat-header";
import { ChatTabs, type ChatTab } from "@/components/messages/chat-tabs";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageComposer } from "@/components/messages/message-composer";
import { ChannelFilesList } from "@/components/messages/channel-files-list";
import { ChannelTasksList } from "@/components/messages/channel-tasks-list";
import { ChannelEventsList } from "@/components/messages/channel-events-list";
import { ChannelInfoPanel } from "@/components/messages/channel-info-panel";
import { MessagesEmptyState } from "@/components/messages/messages-empty-state";
import {
  MEMBER_NAMES,
  channels as defaultChannels,
  currentUserId,
  type Channel,
  type ChatMessageItem
} from "@/components/messages/message-data";

export function MessagesPage() {
  const [channels, setChannels] = useState<Channel[]>(defaultChannels);
  const [activeChannelId, setActiveChannelId] = useState("ad-campaign-team");
  const [activeTab, setActiveTab] = useState<ChatTab>("messages");
  const [filter, setFilter] = useState<ChannelsFilter>("unread");
  const [searchTerm, setSearchTerm] = useState("");
  const [readChannelIds, setReadChannelIds] = useState<Set<string>>(
    () => new Set()
  );

  const effectiveChannels = channels.map((channel) => ({
    ...channel,
    unreadCount: readChannelIds.has(channel.id) ? 0 : channel.unreadCount
  }));

  const searched = effectiveChannels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const filtered = searched.filter((channel) => {
    if (filter === "unread") {
      return channel.unreadCount > 0;
    }
    if (filter === "groups") {
      return channel.kind === "group";
    }
    return true;
  });

  const pinnedChannels = filtered.filter((channel) => channel.pinned);
  const recentChannels = filtered.filter((channel) => !channel.pinned);
  const totalUnread = effectiveChannels.filter(
    (channel) => channel.unreadCount > 0
  ).length;

  const activeChannel = effectiveChannels.find(
    (channel) => channel.id === activeChannelId
  );

  function handleSelectChannel(id: string) {
    setActiveChannelId(id);
    setActiveTab("messages");
    setReadChannelIds((current) => new Set(current).add(id));
  }

  function handleSend(body: string) {
    const message: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      authorId: currentUserId,
      time: "Just now",
      body
    };

    setChannels((current) =>
      current.map((channel) =>
        channel.id === activeChannelId
          ? {
              ...channel,
              messages: [...channel.messages, message],
              lastMessagePreview: `You: ${body}`,
              lastMessageTime: "Just now"
            }
          : channel
      )
    );
  }

  function handleToggleTask(taskId: string) {
    setChannels((current) =>
      current.map((channel) =>
        channel.id === activeChannelId
          ? {
              ...channel,
              tasks: channel.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task
              )
            }
          : channel
      )
    );
  }

  function handleNewChat() {
    const name = window.prompt("Start a new chat — enter a name or topic");

    if (!name || !name.trim()) {
      return;
    }

    const channel: Channel = {
      id: `channel-${Date.now()}`,
      name: name.trim(),
      kind: "group",
      description: `Chat about ${name.trim()}.`,
      memberIds: [currentUserId],
      pinned: false,
      unreadCount: 0,
      lastMessagePreview: "No messages yet",
      lastMessageTime: "Just now",
      colorClass: "bg-slate-500",
      messages: [],
      files: [],
      tasks: [],
      events: []
    };

    setChannels((current) => [channel, ...current]);
    handleSelectChannel(channel.id);
  }

  return (
    <div className="grid gap-6 p-8">
      <div>
        <h1 className="text-3xl font-black text-[#11142c]">Messages</h1>
        <p className="mt-1 text-[#5f667d]">
          Communicate with your team and keep everything in sync.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[20rem_1fr_20rem]">
        <ChannelsSidebar
          activeChannelId={activeChannelId}
          filter={filter}
          onFilterChange={setFilter}
          onNewChat={handleNewChat}
          onSearchChange={setSearchTerm}
          onSelectChannel={handleSelectChannel}
          pinnedChannels={pinnedChannels}
          recentChannels={recentChannels}
          searchTerm={searchTerm}
          unreadCount={totalUnread}
        />

        {activeChannel ? (
          <div className="flex min-h-0 flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
            <ChatHeader channel={activeChannel} />
            <div className="px-4">
              <ChatTabs
                activeTab={activeTab}
                channel={activeChannel}
                onTabChange={setActiveTab}
              />
            </div>

            {activeTab === "messages" ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-4">
                  <div className="mb-3 flex justify-center">
                    <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-[#8a90a3]">
                      Today
                    </span>
                  </div>
                  <div className="grid gap-4 pb-2">
                    {activeChannel.messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                  {activeChannel.typingAuthorId ? (
                    <p className="py-2 text-xs font-medium text-[#8a90a3]">
                      &bull;&bull;&bull;{" "}
                      {MEMBER_NAMES[activeChannel.typingAuthorId]} is typing…
                    </p>
                  ) : null}
                </div>
                <div className="px-4 pb-4">
                  <MessageComposer onSend={handleSend} />
                </div>
              </>
            ) : activeTab === "files" ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <ChannelFilesList files={activeChannel.files} />
              </div>
            ) : activeTab === "tasks" ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <ChannelTasksList
                  onToggle={handleToggleTask}
                  tasks={activeChannel.tasks}
                />
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <ChannelEventsList events={activeChannel.events} />
              </div>
            )}
          </div>
        ) : (
          <MessagesEmptyState />
        )}

        {activeChannel ? <ChannelInfoPanel channel={activeChannel} /> : <div />}
      </div>
    </div>
  );
}
