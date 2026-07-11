import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PresenceStatus = "online" | "away" | "offline";

const STATUS_COLOR: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-gray-300"
};

export function AvatarWithStatus({
  label,
  imageUrl,
  size = "default",
  status
}: {
  userId: string;
  label: string;
  imageUrl?: string | null;
  size?: "sm" | "default" | "lg";
  status?: PresenceStatus;
}) {
  return (
    <span className="relative inline-flex">
      <Avatar size={size}>
        {imageUrl ? <AvatarImage alt="" src={imageUrl} /> : null}
        <AvatarFallback>{label}</AvatarFallback>
      </Avatar>
      {status ? (
        <span
          className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white ${STATUS_COLOR[status]}`}
        />
      ) : null}
    </span>
  );
}
