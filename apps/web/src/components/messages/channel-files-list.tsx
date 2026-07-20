import { Download, FileText } from "lucide-react";
import type { FileEntryItem } from "@/types/base";

function formatSize(bytes: number | null): string {
  if (bytes === null) {
    return "";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChannelFilesList({
  files,
  onDownload
}: {
  files: FileEntryItem[];
  onDownload: (entryId: string) => void;
}) {
  if (files.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#667085] dark:text-[#878ca0]">
        No files shared in this channel yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {files.map((file) => (
        <div
          className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-[#171a28]"
          key={file.id}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <FileText className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
              {file.name}
            </strong>
            <span className="text-xs text-[#667085] dark:text-[#878ca0]">
              {formatSize(file.size)} &bull; {file.uploadedByName}
            </span>
          </span>
          <button
            aria-label={`Download ${file.name}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#667085] hover:bg-black/[0.04] dark:text-[#878ca0] dark:hover:bg-white/[0.06]"
            onClick={() => onDownload(file.id)}
            type="button"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
