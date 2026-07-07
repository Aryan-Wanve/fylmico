import { Download, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MEMBER_AVATARS,
  MEMBER_NAMES,
  getInitials,
  type ChatMessageItem
} from "@/components/messages/message-data";

const MENTION_PATTERN = /@[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g;

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

export function MessageBubble({ message }: { message: ChatMessageItem }) {
  const authorName = MEMBER_NAMES[message.authorId] ?? message.authorId;
  const avatar = MEMBER_AVATARS[message.authorId];

  return (
    <div className="flex items-start gap-3">
      <Avatar>
        {avatar ? <AvatarImage alt="" src={avatar} /> : null}
        <AvatarFallback>{getInitials(message.authorId)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <strong className="text-sm font-bold text-[#11142c]">
            {authorName}
          </strong>
          <span className="text-xs text-[#8a90a3]">{message.time}</span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-[#3a3f57]">
          {renderBody(message.body)}
        </p>
        {message.attachment ? (
          <div className="mt-2 flex max-w-sm items-center gap-3 rounded-xl border border-black/[0.06] bg-[#fafafd] px-3.5 py-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-semibold text-[#11142c]">
                {message.attachment.name}
              </strong>
              <span className="text-xs text-[#8a90a3]">
                {message.attachment.size}
              </span>
            </span>
            <button
              aria-label={`Download ${message.attachment.name}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04]"
              type="button"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
