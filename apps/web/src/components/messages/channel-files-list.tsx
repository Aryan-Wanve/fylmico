import { Download, FileText } from "lucide-react";
import type { ChannelFile } from "@/components/messages/message-data";

export function ChannelFilesList({ files }: { files: ChannelFile[] }) {
  if (files.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#8a90a3]">
        No files shared in this channel yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {files.map((file) => (
        <div
          className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3.5 py-2.5"
          key={file.id}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <FileText className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-semibold text-[#11142c]">
              {file.name}
            </strong>
            <span className="text-xs text-[#8a90a3]">
              {file.size} &bull; {file.authorId} &bull; {file.time}
            </span>
          </span>
          <button
            aria-label={`Download ${file.name}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04]"
            type="button"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
