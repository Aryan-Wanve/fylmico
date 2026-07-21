import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage
} from "@/components/ui/avatar";
import type { HouseMember } from "@/types/base";

const MAX_VISIBLE = 4;

function toInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase() || "?";
}

export function TeamAvatarStack({
  teamIds,
  members
}: {
  teamIds: string[];
  members: HouseMember[];
}) {
  const visibleIds = teamIds.slice(0, MAX_VISIBLE);
  const overflow = teamIds.length - visibleIds.length;

  return (
    <AvatarGroup>
      {visibleIds.map((memberId) => {
        const member = members.find((candidate) => candidate.id === memberId);
        return (
          <Avatar key={memberId} size="sm">
            {member?.avatarUrl ? (
              <AvatarImage alt="" src={member.avatarUrl} />
            ) : null}
            <AvatarFallback>{toInitials(member?.name ?? "?")}</AvatarFallback>
          </Avatar>
        );
      })}
      {overflow > 0 ? (
        <AvatarGroupCount className="size-6 text-xs">
          +{overflow}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}
