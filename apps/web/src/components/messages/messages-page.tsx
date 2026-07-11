"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import {
  createConversation,
  sendChatMessage,
  updateConversation
} from "@/services/base-workspace.service";
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
import { toChannel, type Channel } from "@/components/messages/message-data";

export function MessagesPage() {
  const { workspace, activeHouse, refreshWorkspace } = useWorkspace();
  const members = useMemo(() => activeHouse?.members ?? [], [activeHouse]);
  const memberIds = useMemo(
    () => members.map((member) => member.id),
    [members]
  );

  const channels: Channel[] = useMemo(
    () => workspace.chatRooms.map((room) => toChannel(room, memberIds)),
    [workspace.chatRooms, memberIds]
  );

  const [activeChannelId, setActiveChannelId] = useState(
    () => workspace.chatRooms[0]?.id ?? ""
  );
  const [activeTab, setActiveTab] = useState<ChatTab>("messages");
  const [filter, setFilter] = useState<ChannelsFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const searched = channels.filter((channel) =>
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

  const recentChannels = filtered;
  const totalUnread = channels.filter(
    (channel) => channel.unreadCount > 0
  ).length;

  const activeChannel = channels.find(
    (channel) => channel.id === activeChannelId
  );

  function handleSelectChannel(id: string) {
    setActiveChannelId(id);
    setActiveTab("messages");
  }

  async function handleSend(body: string) {
    if (!activeChannelId) {
      return;
    }

    try {
      await sendChatMessage({ roomId: activeChannelId, body });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not send the message."
      );
    }
  }

  async function handleRenameChannel() {
    if (!activeChannel) {
      return;
    }

    const name = window.prompt("Rename channel", activeChannel.name);
    if (!name || !name.trim() || name.trim() === activeChannel.name) {
      return;
    }

    try {
      await updateConversation(activeChannel.id, { name: name.trim() });
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not rename the channel."
      );
    }
  }

  async function handleNewChat() {
    const name = window.prompt("Start a new channel — enter a name");

    if (!name || !name.trim()) {
      return;
    }

    try {
      const room = await createConversation({ name: name.trim() });
      await refreshWorkspace();
      handleSelectChannel(room.id);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the channel."
      );
    }
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
          pinnedChannels={[]}
          recentChannels={recentChannels}
          searchTerm={searchTerm}
          unreadCount={totalUnread}
        />

        {activeChannel ? (
          <div className="flex min-h-0 flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
            <ChatHeader
              channel={activeChannel}
              onRename={handleRenameChannel}
            />
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
                  onToggle={() => {}}
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

        {activeChannel ? (
          <ChannelInfoPanel
            channel={activeChannel}
            members={members}
            onRename={handleRenameChannel}
            onSelectTab={setActiveTab}
          />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
