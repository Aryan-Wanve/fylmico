import { FolderOpen } from "lucide-react";

export function FilesEmptyState() {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#654cff]/10 text-[#654cff]">
        <FolderOpen className="h-6 w-6" />
      </div>
      <strong className="text-sm font-bold text-[#11142c]">
        This folder is empty
      </strong>
      <p className="max-w-xs text-sm text-[#8a90a3]">
        Upload files or create a new folder to get started.
      </p>
    </div>
  );
}
