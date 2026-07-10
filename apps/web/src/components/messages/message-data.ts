import {
  Clapperboard,
  Headphones,
  Megaphone,
  Palette,
  Wrench,
  type LucideIcon
} from "lucide-react";
import type { ChatMessage, ChatRoom } from "@/types/base";

export type ChatMessageItem = ChatMessage & { time: string };

export type ChannelFile = {
  id: string;
  name: string;
  size: string;
  authorId: string;
  time: string;
};

export type ChannelTask = {
  id: string;
  title: string;
  assigneeId: string;
  done: boolean;
};

export type ChannelEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
};

export type Channel = {
  id: string;
  name: string;
  kind: "group";
  description: string;
  memberIds: string[];
  pinned: boolean;
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageTime: string;
  colorClass: string;
  icon?: LucideIcon;
  messages: ChatMessageItem[];
  files: ChannelFile[];
  tasks: ChannelTask[];
  events: ChannelEvent[];
};

const COLOR_CLASSES = [
  "bg-violet-600",
  "bg-blue-600",
  "bg-pink-600",
  "bg-[#654cff]",
  "bg-slate-700",
  "bg-blue-500",
  "bg-emerald-600",
  "bg-orange-600"
];

const ICONS: LucideIcon[] = [
  Clapperboard,
  Palette,
  Megaphone,
  Headphones,
  Wrench
];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function colorForChannel(id: string): string {
  return COLOR_CLASSES[hashString(id) % COLOR_CLASSES.length];
}

export function iconForChannel(id: string): LucideIcon | undefined {
  return ICONS[hashString(id) % (ICONS.length + 2)];
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function toChannel(room: ChatRoom, memberIds: string[]): Channel {
  const messages: ChatMessageItem[] = room.messages.map((message) => ({
    ...message,
    time: formatMessageTime(message.sentAt)
  }));
  const lastMessage = messages[messages.length - 1];

  return {
    id: room.id,
    name: room.name,
    kind: "group",
    description: room.topic,
    memberIds,
    pinned: false,
    unreadCount: room.unreadCount,
    lastMessagePreview: lastMessage ? lastMessage.body : "No messages yet",
    lastMessageTime: lastMessage ? lastMessage.time : "",
    colorClass: colorForChannel(room.id),
    icon: iconForChannel(room.id),
    messages,
    files: [],
    tasks: [],
    events: []
  };
}

export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase() || "?";
}
