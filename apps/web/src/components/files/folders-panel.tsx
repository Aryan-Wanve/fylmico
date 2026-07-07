"use client";

import { Plus } from "lucide-react";
import { FolderTreeItem } from "@/components/files/folder-tree-item";
import { folderTree } from "@/components/files/file-data";

export function FoldersPanel({
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onNewFolder
}: {
  selectedId: string;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onNewFolder: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
      <div className="flex items-center justify-between px-1 pb-2">
        <strong className="text-sm font-bold text-[#11142c]">Folders</strong>
        <button
          aria-label="New top-level folder"
          className="grid h-6 w-6 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04] hover:text-[#4b5268]"
          onClick={onNewFolder}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-0.5">
          {folderTree.map((node) => (
            <FolderTreeItem
              depth={0}
              expandedIds={expandedIds}
              key={node.id}
              node={node}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              selectedId={selectedId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
