import type { Channel } from "@/components/messages/message-data";

export function ChannelAvatar({
  channel,
  size = "default"
}: {
  channel: Channel;
  size?: "sm" | "default" | "lg";
}) {
  const Icon = channel.icon;
  const initials = channel.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const dimension =
    size === "sm" ? "h-9 w-9" : size === "lg" ? "h-11 w-11" : "h-10 w-10";

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full text-white ${channel.colorClass} ${dimension}`}
    >
      {Icon ? (
        <Icon className="h-5 w-5" />
      ) : (
        <span className="text-sm font-bold">{initials}</span>
      )}
    </span>
  );
}
