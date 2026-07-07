import { ChevronRight, Folder } from "lucide-react";
import type { FolderNode } from "@/components/files/file-data";

export function FolderTreeItem({
  node,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand
}: {
  node: FolderNode;
  depth: number;
  selectedId: string;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const expanded = expandedIds.has(node.id);
  const selected = selectedId === node.id;

  return (
    <div>
      <button
        className={`flex w-full items-center gap-1.5 rounded-lg py-2 pr-2 text-left text-sm font-semibold ${
          selected
            ? "bg-[#654cff]/[0.08] text-[#654cff]"
            : "text-[#4b5268] hover:bg-black/[0.03]"
        }`}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) {
            onToggleExpand(node.id);
          }
        }}
        style={{ paddingLeft: `${0.5 + depth * 1.1}rem` }}
        type="button"
      >
        {hasChildren ? (
          <ChevronRight
            className={`h-3.5 w-3.5 shrink-0 text-[#8a90a3] transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Folder
          className={`h-4 w-4 shrink-0 ${selected ? "text-[#654cff]" : "text-amber-400"}`}
        />
        <span className="truncate">{node.name}</span>
      </button>
      {hasChildren && expanded ? (
        <div className="grid gap-0.5">
          {node.children?.map((child) => (
            <FolderTreeItem
              depth={depth + 1}
              expandedIds={expandedIds}
              key={child.id}
              node={child}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              selectedId={selectedId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
