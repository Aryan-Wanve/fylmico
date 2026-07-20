"use client";

import { useEffect, useRef, useState } from "react";
import { Pin, PinOff, Send } from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { toInitials } from "@/components/tasks/task-data";
import { formatRelativeTime } from "@/lib/relative-time";
import { useConversationChannel } from "@/lib/realtime/use-conversation-channel";
import { useWorkspace } from "@/lib/workspace-context";
import {
  getProjectConversation,
  listOlderMessages,
  pinMessage,
  sendChatMessage
} from "@/services/base-workspace.service";
import type { ChatMessage } from "@/types/base";

export function ProjectChatPanel({ projectId }: { projectId: string }) {
  const { workspace } = useWorkspace();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getProjectConversation(projectId)
      .then(async ({ roomId: id }) => {
        if (cancelled) return;
        setRoomId(id);
        const { messages: initial } = await listOlderMessages(id);
        if (!cancelled) setMessages(initial);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const { status } = useConversationChannel(
    roomId,
    workspace.user.id,
    workspace.user.name,
    {
      onMessage: (message) => {
        setMessages((current) =>
          current.some((m) => m.id === message.id)
            ? current
            : [...current, message]
        );
      },
      onReaction: () => undefined,
      onRead: () => undefined,
      onEdit: (message) => {
        setMessages((current) =>
          current.map((m) => (m.id === message.id ? message : m))
        );
      },
      onDelivered: () => undefined
    }
  );

  async function handleSend() {
    if (!roomId || !draft.trim()) return;
    setSending(true);
    try {
      const message = await sendChatMessage({ roomId, body: draft.trim() });
      setMessages((current) => [...current, message]);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  async function handleTogglePin(messageId: string) {
    const updated = await pinMessage(messageId);
    setMessages((current) =>
      current.map((m) => (m.id === messageId ? updated : m))
    );
  }

  const pinned = messages.filter((message) => message.pinned);

  return (
    <div className="grid gap-4">
      {pinned.length > 0 ? (
        <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
          <span className="text-xs font-bold tracking-wide text-[#667085] uppercase dark:text-[#7d8299]">
            Pinned Notes
          </span>
          <div className="mt-2 grid gap-2">
            {pinned.map((message) => (
              <div className="flex items-start gap-2" key={message.id}>
                <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--fylmico-accent)]" />
                <p className="text-sm text-[#11142c] dark:text-[#f1f2f8]">
                  <strong className="font-semibold">
                    {message.authorName}:
                  </strong>{" "}
                  {message.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="grid max-h-[28rem] gap-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#667085] dark:text-[#7d8299]">
              No messages yet. Start the conversation below.
            </p>
          ) : (
            messages.map((message) => (
              <div className="flex items-start gap-3" key={message.id}>
                <AvatarWithStatus
                  label={toInitials(message.authorName)}
                  size="sm"
                  userId={message.authorId}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                      {message.authorName}
                    </strong>
                    <span className="text-xs text-[#667085] dark:text-[#7d8299]">
                      {formatRelativeTime(message.sentAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[#4b5268] dark:text-[#c7cad9]">
                    {message.body}
                  </p>
                </div>
                <button
                  className="shrink-0 rounded-lg p-1.5 text-[#667085] hover:bg-black/[0.03] dark:text-[#7d8299] dark:hover:bg-white/[0.05]"
                  onClick={() => void handleTogglePin(message.id)}
                  title={message.pinned ? "Unpin" : "Pin"}
                  type="button"
                >
                  {message.pinned ? (
                    <PinOff className="h-3.5 w-3.5" />
                  ) : (
                    <Pin className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-black/5 p-4 dark:border-white/[0.06]">
          <input
            className="h-10 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
            disabled={!roomId}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder={
              status === "connected"
                ? "Message the project..."
                : "Connecting..."
            }
            value={draft}
          />
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--fylmico-accent)] text-white disabled:opacity-50"
            disabled={sending || !draft.trim() || !roomId}
            onClick={() => void handleSend()}
            type="button"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
