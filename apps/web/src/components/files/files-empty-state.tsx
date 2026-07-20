import { FolderOpen } from "lucide-react";

export function FilesEmptyState() {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 py-16 text-center dark:border-white/10">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]">
        <FolderOpen className="h-6 w-6" />
      </div>
      <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
        This folder is empty
      </strong>
      <p className="max-w-xs text-sm text-[#667085] dark:text-[#7d8299]">
        Upload files or create a new folder to get started.
      </p>
    </div>
  );
}
