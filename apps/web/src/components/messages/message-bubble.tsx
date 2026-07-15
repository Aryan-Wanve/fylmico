"use client";

import { useState } from "react";
import { Check, CheckCheck, Clock, CornerUpLeft, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  formatMessageTime,
  getInitials,
  type ChatMessageItem
} from "@/components/messages/message-data";
import { formatRelativeTime } from "@/lib/relative-time";
import { useTicker } from "@/lib/use-ticker";

const MENTION_PATTERN = /@[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g;
const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "😮", "👀"];
const RELATIVE_TIME_WINDOW_MS = 60 * 60_000;
const EDIT_WINDOW_MS = 10 * 60_000;

function getDisplayTime(sentAt: string): string {
  const age = Date.now() - new Date(sentAt).getTime();
  return age < RELATIVE_TIME_WINDOW_MS
    ? formatRelativeTime(sentAt)
    : formatMessageTime(sentAt);
}

function canStillEdit(sentAt: string): boolean {
  return Date.now() - new Date(sentAt).getTime() < EDIT_WINDOW_MS;
}

function renderBody(body: string) {
  const parts = body.split(MENTION_PATTERN);
  const mentions = body.match(MENTION_PATTERN) ?? [];

  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {mentions[index] ? (
        <span className="rounded bg-[#654cff]/10 px-1 font-semibold text-[#654cff]">
          {mentions[index]}
        </span>
      ) : null}
    </span>
  ));
}

function ReadStatusIcon({
  status
}: {
  status: "sending" | "sent" | "delivered" | "read";
}) {
  if (status === "sending") {
    return <Clock className="h-3 w-3 text-[#8a90a3] dark:text-[#7d8299]" />;
  }
  if (status === "read") {
    return <CheckCheck className="h-3 w-3 text-[#654cff]" />;
  }
  if (status === "delivered") {
    return (
      <CheckCheck className="h-3 w-3 text-[#8a90a3] dark:text-[#7d8299]" />
    );
  }
  return <Check className="h-3 w-3 text-[#8a90a3] dark:text-[#7d8299]" />;
}

export function MessageBubble({
  message,
  parentAuthorName,
  onReply,
  onToggleReaction,
  onEdit,
  grouped = false,
  isOwn = false,
  readStatus
}: {
  message: ChatMessageItem;
  parentAuthorName?: string;
  onReply: () => void;
  onToggleReaction: (emoji: string) => void;
  onEdit?: (body: string) => void;
  grouped?: boolean;
  isOwn?: boolean;
  readStatus?: "sending" | "sent" | "delivered" | "read";
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const isReply = Boolean(message.parentMessageId);
  useTicker();

  const displayTime = getDisplayTime(message.sentAt);
  const canEdit = isOwn && Boolean(onEdit) && canStillEdit(message.sentAt);

  function startEditing() {
    setDraft(message.body);
    setIsEditing(true);
  }

  function saveEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.body) {
      onEdit?.(trimmed);
    }
    setIsEditing(false);
  }

  return (
    <div
      className={`group flex items-start gap-3 ${isReply ? "ml-10 border-l-2 border-black/[0.06] pl-3 dark:border-white/[0.08]" : ""} ${grouped ? "-mt-2.5" : ""}`}
    >
      <div className="w-8 shrink-0">
        {grouped ? null : (
          <Avatar>
            <AvatarFallback>{getInitials(message.authorName)}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {isReply && parentAuthorName ? (
          <div className="mb-0.5 flex items-center gap-1 text-xs text-[#8a90a3] dark:text-[#7d8299]">
            <CornerUpLeft className="h-3 w-3" />
            Replying to {parentAuthorName}
          </div>
        ) : null}
        {grouped ? null : (
          <div className="flex items-center gap-2">
            <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              {message.authorName}
            </strong>
            <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
              {displayTime}
              {message.editedAt ? " (edited)" : ""}
            </span>
          </div>
        )}
        {isEditing ? (
          <div className="mt-0.5 grid gap-1.5">
            <textarea
              autoFocus
              className="w-full resize-none rounded-lg border border-[#654cff]/40 bg-transparent p-2 text-sm text-[#3a3f57] outline-none dark:text-[#b4b8cc]"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  saveEdit();
                } else if (event.key === "Escape") {
                  setIsEditing(false);
                }
              }}
              rows={2}
              value={draft}
            />
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                className="text-[#654cff] hover:underline"
                onClick={saveEdit}
                type="button"
              >
                Save
              </button>
              <button
                className="text-[#8a90a3] hover:underline dark:text-[#7d8299]"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="mt-0.5 text-sm leading-relaxed text-[#3a3f57] dark:text-[#b4b8cc]">
              {renderBody(message.body)}
              {message.editedAt && grouped ? (
                <span className="ml-1 text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  (edited)
                </span>
              ) : null}
            </p>
            {grouped ? (
              <span className="mt-0.5 text-xs whitespace-nowrap text-[#8a90a3] opacity-0 group-hover:opacity-100 dark:text-[#7d8299]">
                {displayTime}
              </span>
            ) : null}
          </div>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {message.reactions.map((reaction) => (
            <button
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                reaction.reactedByMe
                  ? "border-[#654cff]/40 bg-[#654cff]/10 text-[#654cff]"
                  : "border-black/10 bg-black/[0.02] text-[#5f667d] hover:bg-black/[0.05] dark:border-white/10 dark:bg-white/[0.03] dark:text-[#a8acbf]"
              }`}
              key={reaction.emoji}
              onClick={() => onToggleReaction(reaction.emoji)}
              type="button"
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </button>
          ))}

          <div className="relative">
            <button
              aria-label="Add reaction"
              className="grid h-6 w-6 place-items-center rounded-full text-[#8a90a3] opacity-0 group-hover:opacity-100 hover:bg-black/[0.05] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
              onClick={() => setPickerOpen((current) => !current)}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            {pickerOpen ? (
              <div className="absolute top-7 left-0 z-10 flex items-center gap-1 rounded-xl border border-black/[0.06] bg-white p-1.5 shadow-[0_0.5rem_1.5rem_rgba(53,45,124,0.12)] dark:border-white/[0.08] dark:bg-[#171a28]">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    className="grid h-7 w-7 place-items-center rounded-lg text-base hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
                    key={emoji}
                    onClick={() => {
                      onToggleReaction(emoji);
                      setPickerOpen(false);
                    }}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            className="ml-1 flex items-center gap-1 text-xs font-semibold text-[#8a90a3] opacity-0 group-hover:opacity-100 hover:text-[#654cff] dark:text-[#7d8299]"
            onClick={onReply}
            type="button"
          >
            <CornerUpLeft className="h-3 w-3" />
            Reply
          </button>

          {canEdit && !isEditing ? (
            <button
              className="flex items-center gap-1 text-xs font-semibold text-[#8a90a3] opacity-0 group-hover:opacity-100 hover:text-[#654cff] dark:text-[#7d8299]"
              onClick={startEditing}
              type="button"
            >
              Edit
            </button>
          ) : null}

          {message.replyCount > 0 ? (
            <span className="text-xs font-semibold text-[#654cff]">
              {message.replyCount}{" "}
              {message.replyCount === 1 ? "reply" : "replies"}
            </span>
          ) : null}

          {isOwn && readStatus ? (
            <span className="ml-auto flex items-center">
              <ReadStatusIcon status={readStatus} />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
