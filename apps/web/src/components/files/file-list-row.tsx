import {
  FILE_KIND_META,
  formatFileSize,
  inferFileKind
} from "@/components/files/file-data";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { FileCardMenu } from "@/components/files/file-card-menu";
import { formatRelativeTime } from "@/lib/relative-time";
import type { FileEntryItem } from "@/types/base";

export function FileListRow({
  file,
  onOpen,
  onDelete,
  onDownload
}: {
  file: FileEntryItem;
  onOpen?: () => void;
  onDelete: () => void;
  onDownload?: () => void;
}) {
  const kind = inferFileKind(file.type, file.mimeType);
  const meta = FILE_KIND_META[kind];
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015] dark:border-white/[0.06] dark:hover:bg-white/[0.03]">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        disabled={!onOpen}
        onClick={onOpen}
        type="button"
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${meta.bg} ${meta.color}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <strong className="truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
          {file.name}
        </strong>
      </button>

      <span className="hidden w-24 shrink-0 text-sm text-[#4b5268] sm:block dark:text-[#c7cad9]">
        {file.type === "folder" ? "—" : formatFileSize(file.size)}
      </span>

      <span className="hidden w-24 shrink-0 text-sm text-[#4b5268] md:block dark:text-[#c7cad9]">
        {meta.label}
      </span>

      <span className="hidden w-36 shrink-0 text-sm text-[#4b5268] lg:block dark:text-[#c7cad9]">
        {formatRelativeTime(file.updatedAt)}
      </span>

      <div className="hidden w-32 shrink-0 items-center gap-2 xl:flex">
        <AvatarWithStatus
          label={file.uploadedByName.slice(0, 2).toUpperCase()}
          size="sm"
          userId={file.uploadedById}
        />
        <span className="truncate text-sm text-[#4b5268] dark:text-[#c7cad9]">
          {file.uploadedByName}
        </span>
      </div>

      <FileCardMenu onDelete={onDelete} onDownload={onDownload} />
    </div>
  );
}
