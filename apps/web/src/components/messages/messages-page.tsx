"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { usePrompt } from "@/components/ui/prompt-dialog";
import {
  createConversation,
  createRoomEvent,
  createRoomTask,
  getFileDownloadUrl,
  listRoomEvents,
  listRoomFiles,
  listRoomTasks,
  sendChatMessage,
  toggleMessageReaction,
  updateConversation,
  updateTask
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
import type {
  CalendarEvent,
  FileEntryItem,
  ProductionTask
} from "@/types/base";

export function MessagesPage() {
  const { workspace, activeHouse, refreshWorkspace } = useWorkspace();
  const prompt = usePrompt();
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

  const [roomFiles, setRoomFiles] = useState<FileEntryItem[]>([]);
  const [roomTasks, setRoomTasks] = useState<ProductionTask[]>([]);
  const [roomEvents, setRoomEvents] = useState<CalendarEvent[]>([]);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const replyingToMessage = activeChannel?.messages.find(
    (message) => message.id === replyingToId
  );

  useEffect(() => {
    if (!activeChannelId) {
      return;
    }

    let cancelled = false;

    if (activeTab === "files") {
      listRoomFiles(activeChannelId)
        .then((data) => {
          if (!cancelled) setRoomFiles(data);
        })
        .catch(() => {
          // Files tab fails quietly - it's a secondary view.
        });
    } else if (activeTab === "tasks") {
      listRoomTasks(activeChannelId)
        .then((data) => {
          if (!cancelled) setRoomTasks(data);
        })
        .catch(() => {
          // Tasks tab fails quietly - it's a secondary view.
        });
    } else if (activeTab === "events") {
      listRoomEvents(activeChannelId)
        .then((data) => {
          if (!cancelled) setRoomEvents(data);
        })
        .catch(() => {
          // Events tab fails quietly - it's a secondary view.
        });
    }

    return () => {
      cancelled = true;
    };
  }, [activeChannelId, activeTab]);

  async function handleDownloadFile(entryId: string) {
    try {
      const url = await getFileDownloadUrl(entryId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not download the file."
      );
    }
  }

  async function handleAddTask() {
    if (!activeChannelId) {
      return;
    }

    const title = await prompt("Task title");
    if (!title || !title.trim()) {
      return;
    }

    try {
      const tasks = await createRoomTask(activeChannelId, title.trim());
      setRoomTasks(tasks);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the task."
      );
    }
  }

  async function handleToggleRoomTask(taskId: string) {
    if (!activeChannelId) {
      return;
    }

    const task = roomTasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    try {
      await updateTask(taskId, {
        status: task.status === "done" ? "todo" : "done"
      });
      const tasks = await listRoomTasks(activeChannelId);
      setRoomTasks(tasks);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update the task."
      );
    }
  }

  async function handleAddEvent() {
    if (!activeChannelId) {
      return;
    }

    const title = await prompt("Event title");
    if (!title || !title.trim()) {
      return;
    }

    const date = await prompt("Date (YYYY-MM-DD)");
    if (!date || !date.trim()) {
      return;
    }

    const time = await prompt("Time (e.g. 3:00 PM)");
    if (!time || !time.trim()) {
      return;
    }

    try {
      const events = await createRoomEvent(activeChannelId, {
        title: title.trim(),
        date: date.trim(),
        time: time.trim()
      });
      setRoomEvents(events);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the event."
      );
    }
  }

  function handleSelectChannel(id: string) {
    setActiveChannelId(id);
    setActiveTab("messages");
    setReplyingToId(null);
  }

  async function handleSend(body: string) {
    if (!activeChannelId) {
      return;
    }

    try {
      await sendChatMessage({
        roomId: activeChannelId,
        body,
        parentMessageId: replyingToId ?? undefined
      });
      setReplyingToId(null);
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not send the message."
      );
    }
  }

  async function handleToggleReaction(messageId: string, emoji: string) {
    try {
      await toggleMessageReaction(messageId, emoji);
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not react to the message."
      );
    }
  }

  async function handleRenameChannel() {
    if (!activeChannel) {
      return;
    }

    const name = await prompt("Rename channel", activeChannel.name);
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
    const name = await prompt("Start a new channel — enter a name");

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
    <div className="grid grid-cols-1 gap-6 p-8">
      <div>
        <h1 className="text-3xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Messages
        </h1>
        <p className="mt-1 text-[#5f667d] dark:text-[#a8acbf]">
          Communicate with your team and keep everything in sync.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-[20rem_1fr_20rem]">
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
          <div className="flex min-h-0 flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            <ChatHeader
              channel={activeChannel}
              onRename={handleRenameChannel}
            />
            <div className="px-4">
              <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {activeTab === "messages" ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-4">
                  <div className="mb-3 flex justify-center">
                    <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-[#8a90a3] dark:bg-white/[0.06] dark:text-[#7d8299]">
                      Today
                    </span>
                  </div>
                  <div className="grid gap-4 pb-2">
                    {activeChannel.messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        onReply={() => setReplyingToId(message.id)}
                        onToggleReaction={(emoji) =>
                          handleToggleReaction(message.id, emoji)
                        }
                        parentAuthorName={
                          message.parentMessageId
                            ? activeChannel.messages.find(
                                (candidate) =>
                                  candidate.id === message.parentMessageId
                              )?.authorName
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <MessageComposer
                    onCancelReply={() => setReplyingToId(null)}
                    onSend={handleSend}
                    replyingToName={replyingToMessage?.authorName}
                    roomId={activeChannel.id}
                  />
                </div>
              </>
            ) : activeTab === "files" ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <ChannelFilesList
                  files={roomFiles}
                  onDownload={handleDownloadFile}
                />
              </div>
            ) : activeTab === "tasks" ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <button
                  className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#654cff] hover:underline"
                  onClick={handleAddTask}
                  type="button"
                >
                  + Add task
                </button>
                <ChannelTasksList
                  onToggle={handleToggleRoomTask}
                  tasks={roomTasks}
                />
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <button
                  className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#654cff] hover:underline"
                  onClick={handleAddEvent}
                  type="button"
                >
                  + Add event
                </button>
                <ChannelEventsList events={roomEvents} />
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
