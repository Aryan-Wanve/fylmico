import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage
} from "@/components/ui/avatar";
import {
  MEMBER_AVATARS,
  MEMBER_LABELS
} from "@/components/projects/project-data";

export function TeamAvatarStack({
  teamIds,
  overflow
}: {
  teamIds: string[];
  overflow: number;
}) {
  return (
    <AvatarGroup>
      {teamIds.map((memberId) => (
        <Avatar key={memberId} size="sm">
          <AvatarImage alt="" src={MEMBER_AVATARS[memberId]} />
          <AvatarFallback>{MEMBER_LABELS[memberId] ?? "?"}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 ? (
        <AvatarGroupCount className="size-6 text-xs">
          +{overflow}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}
