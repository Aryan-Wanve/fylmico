import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
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
  return (
    <div className="flex items-start gap-3">
      <Avatar>
        <AvatarFallback>{getInitials(message.authorName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {message.authorName}
          </strong>
          <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            {message.time}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-[#3a3f57] dark:text-[#b4b8cc]">
          {renderBody(message.body)}
        </p>
      </div>
    </div>
  );
}
