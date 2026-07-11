import {
  FILE_KIND_META,
  MEMBER_AVATARS,
  MEMBER_NAMES,
  type FileEntry
} from "@/components/files/file-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileCardMenu } from "@/components/files/file-card-menu";

export function FileListRow({
  file,
  onDelete
}: {
  file: FileEntry;
  onDelete: () => void;
}) {
  const meta = FILE_KIND_META[file.kind];
  const Icon = meta.icon;
  const memberName = MEMBER_NAMES[file.modifiedBy] ?? file.modifiedBy;
  const memberAvatar = MEMBER_AVATARS[file.modifiedBy];

  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${meta.bg} ${meta.color}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <strong className="truncate text-sm font-semibold text-[#11142c]">
          {file.name}
        </strong>
      </div>

      <span className="hidden w-24 shrink-0 text-sm text-[#4b5268] sm:block">
        {file.size ?? `${file.itemCount} items`}
      </span>

      <span className="hidden w-24 shrink-0 text-sm text-[#4b5268] md:block">
        {meta.label}
      </span>

      <span className="hidden w-36 shrink-0 text-sm text-[#4b5268] lg:block">
        {file.modified}
      </span>

      <div className="hidden w-32 shrink-0 items-center gap-2 xl:flex">
        <Avatar size="sm">
          {memberAvatar ? <AvatarImage alt="" src={memberAvatar} /> : null}
          <AvatarFallback>
            {memberName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm text-[#4b5268]">{memberName}</span>
      </div>

      <FileCardMenu onDelete={onDelete} />
    </div>
  );
}
