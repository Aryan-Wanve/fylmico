import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AVATAR_IMAGES: Record<string, string> = {
  "user-aryan": "/images/dashboard/avatar-aryan.jpg",
  "user-priya": "/images/dashboard/avatar-priya.jpg",
  "user-rahul": "/images/dashboard/avatar-rahul.jpg",
  "user-ananya": "/images/dashboard/avatar-ananya.jpg",
  "user-karan": "/images/dashboard/avatar-karan.jpg"
};

type PresenceStatus = "online" | "away" | "offline";

const STATUS_COLOR: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-gray-300"
};

export function AvatarWithStatus({
  userId,
  label,
  size = "default",
  status
}: {
  userId: string;
  label: string;
  size?: "sm" | "default" | "lg";
  status?: PresenceStatus;
}) {
  const image = AVATAR_IMAGES[userId];

  return (
    <span className="relative inline-flex">
      <Avatar size={size}>
        {image ? <AvatarImage alt="" src={image} /> : null}
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
