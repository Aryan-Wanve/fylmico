"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import { usePrompt } from "@/components/ui/prompt-dialog";
import { useConversationChannel } from "@/lib/realtime/use-conversation-channel";
import { useHouseChatDigest } from "@/lib/realtime/use-house-chat-digest";
import { usePresence } from "@/lib/realtime/use-presence";
import {
  dequeueMessage,
  enqueueMessage,
  getQueuedMessages
} from "@/lib/realtime/offline-queue";
import {
  createConversation,
  createRoomEvent,
  createRoomTask,
  editChatMessage,
  getFileDownloadUrl,
  listOlderMessages,
  listRoomEvents,
  listRoomFiles,
  listRoomTasks,
  markConversationRead,
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
import {
  formatMessageTime,
  toChannel,
  type Channel,
  type ChatMessageItem
} from "@/components/messages/message-data";
import type {
  CalendarEvent,
  ChannelTaskItem,
  ChatMessage,
  FileEntryItem
} from "@/types/base";

const NEAR_BOTTOM_THRESHOLD_PX = 120;

export function MessagesPage() {
  const { workspace, activeHouse, refreshWorkspace } = useWorkspace();
  const prompt = usePrompt();
  const selfId = workspace.user.id;
  const members = useMemo(() => activeHouse?.members ?? [], [activeHouse]);
  const memberIds = useMemo(
    () => members.map((member) => member.id),
    [members]
  );

  function buildChannels(): Channel[] {
    const queued = getQueuedMessages();
    return workspace.chatRooms.map((room) => {
      const channel = toChannel(room, memberIds);
      const pending: ChatMessageItem[] = queued
        .filter((entry) => entry.roomId === room.id)
        .map((entry) => ({
          id: entry.tempId,
          conversationId: entry.roomId,
          authorId: selfId,
          authorName: workspace.user.name,
          sentAt: new Date().toISOString(),
          body: entry.body,
          editedAt: null,
          pinned: false,
          parentMessageId: entry.parentMessageId ?? null,
          replyCount: 0,
          reactions: [],
          time: "Sending...",
          status: "sending"
        }));
      return pending.length
        ? { ...channel, messages: [...channel.messages, ...pending] }
        : channel;
    });
  }

  const [channels, setChannels] = useState<Channel[]>(buildChannels);

  // Resyncs from the workspace snapshot on structural changes (create/
  // rename a channel, switch houses) - per-message updates below patch
  // `channels` directly instead of refetching everything.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- rebuilding local chat state from a new workspace snapshot, not deriving render output
    setChannels(buildChannels());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.chatRooms, memberIds]);

  // Retries any messages queued while offline, once on mount and again
  // whenever the browser regains connectivity.
  useEffect(() => {
    async function flushQueue() {
      for (const entry of getQueuedMessages()) {
        try {
          const sent = await sendChatMessage({
            roomId: entry.roomId,
            body: entry.body,
            parentMessageId: entry.parentMessageId
          });
          dequeueMessage(entry.tempId);
          patchChannelMessages(sent.conversationId, (messages) =>
            messages.map((message) =>
              message.id === entry.tempId
                ? {
                    ...sent,
                    time: formatMessageTime(sent.sentAt),
                    status: "sent"
                  }
                : message
            )
          );
        } catch {
          // Still offline/still failing - stop here to preserve send order,
          // the rest stay queued for the next flush.
          break;
        }
      }
    }

    void flushQueue();
    window.addEventListener("online", flushQueue);
    return () => window.removeEventListener("online", flushQueue);
  }, []);

  const [activeChannelId, setActiveChannelId] = useState(
    () => workspace.chatRooms[0]?.id ?? ""
  );
  const [activeTab, setActiveTab] = useState<ChatTab>("messages");
  const [filter, setFilter] = useState<ChannelsFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [newMessagesBelow, setNewMessagesBelow] = useState(false);
  const isNearBottomRef = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onlineUserIds = usePresence(
    activeHouse?.id ?? null,
    selfId,
    workspace.user.name
  );

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
  const [roomTasks, setRoomTasks] = useState<ChannelTaskItem[]>([]);
  const [roomEvents, setRoomEvents] = useState<CalendarEvent[]>([]);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const replyingToMessage = activeChannel?.messages.find(
    (message) => message.id === replyingToId
  );

  function patchChannelMessages(
    conversationId: string,
    updater: (messages: ChatMessageItem[]) => ChatMessageItem[]
  ) {
    setChannels((current) =>
      current.map((channel) => {
        if (channel.id !== conversationId) {
          return channel;
        }
        const messages = updater(channel.messages);
        const last = messages[messages.length - 1];
        return {
          ...channel,
          messages,
          // Keeps the sidebar preview correct for the sender's own client
          // too, not just for peers reached via the house digest channel.
          lastMessagePreview: last ? last.body : channel.lastMessagePreview,
          lastMessageTime: last ? last.time : channel.lastMessageTime
        };
      })
    );
  }

  function upsertMessage(message: ChatMessage) {
    const item: ChatMessageItem = {
      ...message,
      time: formatMessageTime(message.sentAt)
    };
    patchChannelMessages(message.conversationId, (messages) => {
      const index = messages.findIndex((existing) => existing.id === item.id);
      if (index === -1) {
        return [...messages, item];
      }
      const next = messages.slice();
      next[index] = item;
      return next;
    });
  }

  const scrollToBottom = useCallback((smooth: boolean) => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    node.scrollTo({
      top: node.scrollHeight,
      behavior: smooth ? "smooth" : "auto"
    });
  }, []);

  const readAtByUser = useRef<Map<string, Map<string, string>>>(new Map());

  const {
    status: connectionStatus,
    typingUsers,
    notifyTyping
  } = useConversationChannel(
    activeChannelId || null,
    selfId,
    workspace.user.name,
    {
      onMessage: (message) => {
        upsertMessage(message);
        if (message.authorId === selfId) {
          return;
        }
        if (
          message.conversationId === activeChannelId &&
          isNearBottomRef.current
        ) {
          scrollToBottom(true);
          void markConversationRead(message.conversationId);
        } else if (message.conversationId === activeChannelId) {
          setNewMessagesBelow(true);
        }
      },
      onReaction: upsertMessage,
      onEdit: upsertMessage,
      onDelivered: (messageId) => {
        patchChannelMessages(activeChannelId, (messages) =>
          messages.map((message) =>
            message.id === messageId && message.status === "sent"
              ? { ...message, status: "delivered" }
              : message
          )
        );
      },
      onRead: (userId, lastReadAt) => {
        if (!activeChannelId) {
          return;
        }
        const byConversation = readAtByUser.current;
        const perUser = byConversation.get(activeChannelId) ?? new Map();
        perUser.set(userId, lastReadAt);
        byConversation.set(activeChannelId, perUser);
        // Force a render so read ticks (derived below) recompute.
        setChannels((current) => current.slice());
      }
    }
  );

  useHouseChatDigest(activeHouse?.id ?? null, (digest) => {
    setChannels((current) =>
      current.map((channel) => {
        if (channel.id !== digest.conversationId) {
          return channel;
        }
        const isViewingActive =
          channel.id === activeChannelId && isNearBottomRef.current;
        const isOwnMessage = digest.authorId === selfId;
        return {
          ...channel,
          lastMessagePreview: digest.body,
          lastMessageTime: formatMessageTime(digest.sentAt),
          unreadCount:
            isOwnMessage || isViewingActive
              ? channel.unreadCount
              : channel.unreadCount + 1
        };
      })
    );
  });

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

  // Mark read + snap to bottom whenever the active channel changes.
  useEffect(() => {
    if (!activeChannelId) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting per-channel UI state on channel switch, not deriving render output
    setHasMoreOlder(true);
    setNewMessagesBelow(false);
    isNearBottomRef.current = true;
    scrollToBottom(false);
    markConversationRead(activeChannelId).catch(() => {
      // Best-effort - a failed read receipt just leaves the badge stale.
    });
  }, [activeChannelId, scrollToBottom]);

  function handleScroll() {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    const distanceFromBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;
    const near = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
    isNearBottomRef.current = near;
    if (near) {
      setNewMessagesBelow(false);
    }
  }

  async function handleLoadOlder() {
    if (!activeChannelId || loadingOlder || !hasMoreOlder) {
      return;
    }
    const oldest = activeChannel?.messages[0];
    setLoadingOlder(true);
    const node = scrollRef.current;
    const previousHeight = node?.scrollHeight ?? 0;
    try {
      const { messages, nextCursor } = await listOlderMessages(
        activeChannelId,
        oldest?.id
      );
      setHasMoreOlder(Boolean(nextCursor));
      patchChannelMessages(activeChannelId, (current) => {
        const existingIds = new Set(current.map((message) => message.id));
        const older = messages
          .filter((message) => !existingIds.has(message.id))
          .map((message) => ({
            ...message,
            time: formatMessageTime(message.sentAt)
          }));
        return [...older, ...current];
      });
      requestAnimationFrame(() => {
        if (node) {
          node.scrollTop = node.scrollHeight - previousHeight;
        }
      });
    } catch {
      // Loading older history fails quietly - the button just stays put.
    } finally {
      setLoadingOlder(false);
    }
  }

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
        status: task.status === "completed" ? "todo" : "completed"
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

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimistic: ChatMessageItem = {
      id: tempId,
      conversationId: activeChannelId,
      authorId: selfId,
      authorName: workspace.user.name,
      sentAt: new Date().toISOString(),
      body,
      editedAt: null,
      pinned: false,
      parentMessageId: replyingToId,
      replyCount: 0,
      reactions: [],
      time: "Sending...",
      status: "sending"
    };
    patchChannelMessages(activeChannelId, (messages) => [
      ...messages,
      optimistic
    ]);
    setReplyingToId(null);
    scrollToBottom(true);

    try {
      const sent = await sendChatMessage({
        roomId: activeChannelId,
        body,
        parentMessageId: optimistic.parentMessageId ?? undefined
      });
      patchChannelMessages(sent.conversationId, (messages) =>
        messages.map((message) =>
          message.id === tempId
            ? { ...sent, time: formatMessageTime(sent.sentAt), status: "sent" }
            : message
        )
      );
    } catch (error) {
      // A real server rejection (ApiError) means retrying won't help -
      // drop the optimistic bubble and tell the user. Anything else (fetch
      // itself failing) is treated as "offline" and queued for retry
      // instead of losing what they typed.
      if (!(error instanceof ApiError)) {
        enqueueMessage({
          tempId,
          roomId: activeChannelId,
          body,
          parentMessageId: optimistic.parentMessageId ?? undefined
        });
        return;
      }

      patchChannelMessages(activeChannelId, (messages) =>
        messages.filter((message) => message.id !== tempId)
      );
      window.alert(error.message);
    }
  }

  async function handleToggleReaction(messageId: string, emoji: string) {
    try {
      const updated = await toggleMessageReaction(messageId, emoji);
      upsertMessage(updated);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not react to the message."
      );
    }
  }

  async function handleEditMessage(messageId: string, body: string) {
    try {
      const updated = await editChatMessage({ messageId, body });
      upsertMessage(updated);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not save the edit."
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

  const readTimestampsForActive = activeChannelId
    ? (readAtByUser.current.get(activeChannelId) ?? new Map())
    : new Map<string, string>();
  const latestOtherReadAt = readTimestampsForActive.size
    ? [...readTimestampsForActive.values()].sort().at(-1)
    : undefined;

  return (
    <div className="grid grid-cols-1 gap-6 p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-[#11142c] dark:text-[#f1f2f8]">
            Messages
          </h1>
          <p className="mt-1 text-[#5f667d] dark:text-[#a8acbf]">
            Communicate with your team and keep everything in sync.
          </p>
        </div>
        {connectionStatus === "disconnected" ? (
          <span className="shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            Reconnecting…
          </span>
        ) : connectionStatus === "connecting" ? (
          <span className="shrink-0 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold text-[#8a90a3] dark:bg-white/[0.06] dark:text-[#7d8299]">
            Connecting…
          </span>
        ) : null}
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
                <div
                  className="relative min-h-0 flex-1 overflow-y-auto px-4"
                  onScroll={handleScroll}
                  ref={scrollRef}
                >
                  {hasMoreOlder ? (
                    <div className="mb-3 flex justify-center">
                      <button
                        className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-[#8a90a3] hover:bg-black/[0.07] disabled:opacity-50 dark:bg-white/[0.06] dark:text-[#7d8299] dark:hover:bg-white/[0.1]"
                        disabled={loadingOlder}
                        onClick={handleLoadOlder}
                        type="button"
                      >
                        {loadingOlder ? "Loading…" : "Load earlier messages"}
                      </button>
                    </div>
                  ) : null}
                  <div className="grid gap-4 pb-2">
                    {activeChannel.messages.map((message, index) => {
                      const previous = activeChannel.messages[index - 1];
                      const grouped = Boolean(
                        previous &&
                        previous.authorId === message.authorId &&
                        !message.parentMessageId &&
                        new Date(message.sentAt).getTime() -
                          new Date(previous.sentAt).getTime() <
                          5 * 60_000
                      );
                      const isRead =
                        message.authorId === selfId &&
                        Boolean(
                          latestOtherReadAt &&
                          latestOtherReadAt >= message.sentAt
                        );

                      return (
                        <MessageBubble
                          grouped={grouped}
                          isOwn={message.authorId === selfId}
                          key={message.id}
                          message={message}
                          onEdit={(body) => handleEditMessage(message.id, body)}
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
                          readStatus={
                            message.authorId !== selfId
                              ? undefined
                              : isRead
                                ? "read"
                                : (message.status ?? "sent")
                          }
                        />
                      );
                    })}
                  </div>
                  {typingUsers.length > 0 ? (
                    <p className="pb-1 text-xs font-semibold text-[#8a90a3] italic dark:text-[#7d8299]">
                      {typingUsers.join(", ")}{" "}
                      {typingUsers.length === 1 ? "is" : "are"} typing…
                    </p>
                  ) : null}
                  {newMessagesBelow ? (
                    <button
                      className="sticky bottom-2 left-1/2 mx-auto flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#654cff] px-3 py-1.5 text-xs font-bold text-white shadow-lg"
                      onClick={() => {
                        scrollToBottom(true);
                        setNewMessagesBelow(false);
                        void markConversationRead(activeChannelId);
                      }}
                      type="button"
                    >
                      New messages ↓
                    </button>
                  ) : null}
                </div>
                <div className="px-4 pb-4">
                  <MessageComposer
                    onCancelReply={() => setReplyingToId(null)}
                    onSend={handleSend}
                    onTyping={notifyTyping}
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
            onlineUserIds={onlineUserIds}
          />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
