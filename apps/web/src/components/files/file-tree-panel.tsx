"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Folder, FolderOpen, FolderTree } from "lucide-react";
import { listFileEntries } from "@/services/base-workspace.service";
import type { FileEntryItem } from "@/types/base";

export type TreeCrumb = { id: string | null; name: string };

export function FileTreePanel({
  activeFolderId,
  sensitiveView,
  refreshToken,
  onNavigate
}: {
  activeFolderId: string | null;
  sensitiveView: boolean;
  refreshToken: number;
  onNavigate: (path: TreeCrumb[]) => void;
}) {
  const rootLabel = sensitiveView ? "Sensitive" : "All Files";
  const rootCrumb: TreeCrumb = { id: null, name: rootLabel };
  const [rootFolders, setRootFolders] = useState<FileEntryItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    listFileEntries(null, sensitiveView)
      .then((entries) => {
        if (!cancelled) {
          setRootFolders(entries.filter((entry) => entry.type === "folder"));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRootFolders([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sensitiveView, refreshToken]);

  return (
    <div className="grid min-h-0 content-start gap-2 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center gap-2 px-1 pb-1 text-xs font-semibold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
        <FolderTree className="h-3.5 w-3.5" />
        Folders
      </div>

      <button
        className={`flex w-full items-center gap-1.5 truncate rounded-lg px-2 py-1.5 text-left text-sm font-semibold ${
          activeFolderId === null
            ? "bg-[#654cff]/10 text-[#654cff]"
            : "text-[#4b5268] hover:bg-black/[0.03] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
        }`}
        onClick={() => onNavigate([rootCrumb])}
        type="button"
      >
        <FolderOpen className="h-4 w-4 shrink-0" />
        <span className="truncate">{rootLabel}</span>
      </button>

      <div className="grid gap-0.5">
        {rootFolders === null ? (
          <p className="px-2 py-1.5 text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Loading...
          </p>
        ) : rootFolders.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-[#8a90a3] dark:text-[#7d8299]">
            No folders yet.
          </p>
        ) : (
          rootFolders.map((folder) => (
            <FileTreeNode
              activeFolderId={activeFolderId}
              ancestors={[rootCrumb]}
              depth={0}
              key={folder.id}
              node={folder}
              onNavigate={onNavigate}
              refreshToken={refreshToken}
              sensitiveView={sensitiveView}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FileTreeNode({
  node,
  depth,
  ancestors,
  activeFolderId,
  sensitiveView,
  refreshToken,
  onNavigate
}: {
  node: FileEntryItem;
  depth: number;
  ancestors: TreeCrumb[];
  activeFolderId: string | null;
  sensitiveView: boolean;
  refreshToken: number;
  onNavigate: (path: TreeCrumb[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntryItem[] | null>(null);
  const isActive = node.id === activeFolderId;
  const path = [...ancestors, { id: node.id, name: node.name }];

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;

    listFileEntries(node.id, sensitiveView)
      .then((entries) => {
        if (!cancelled) {
          setChildren(entries.filter((entry) => entry.type === "folder"));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setChildren([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [expanded, node.id, sensitiveView, refreshToken]);

  return (
    <div>
      <div
        className={`flex items-center gap-0.5 rounded-lg py-1.5 pr-2 text-sm ${
          isActive
            ? "bg-[#654cff]/10 font-semibold text-[#654cff]"
            : "text-[#4b5268] hover:bg-black/[0.03] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
        }`}
        style={{ paddingLeft: `${0.375 + depth * 1}rem` }}
      >
        <button
          aria-label={expanded ? "Collapse folder" : "Expand folder"}
          className="grid h-5 w-5 shrink-0 place-items-center text-[#8a90a3] dark:text-[#7d8299]"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
        <button
          className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-left"
          onClick={() => {
            setExpanded(true);
            onNavigate(path);
          }}
          type="button"
        >
          {expanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-[#f2b64c]" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-[#f2b64c]" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {expanded ? (
        children === null ? (
          <p
            className="py-1 text-xs text-[#8a90a3] dark:text-[#7d8299]"
            style={{ paddingLeft: `${1.75 + depth * 1}rem` }}
          >
            Loading...
          </p>
        ) : children.length === 0 ? (
          <p
            className="py-1 text-xs text-[#8a90a3] dark:text-[#7d8299]"
            style={{ paddingLeft: `${1.75 + depth * 1}rem` }}
          >
            No subfolders
          </p>
        ) : (
          children.map((child) => (
            <FileTreeNode
              activeFolderId={activeFolderId}
              ancestors={path}
              depth={depth + 1}
              key={child.id}
              node={child}
              onNavigate={onNavigate}
              refreshToken={refreshToken}
              sensitiveView={sensitiveView}
            />
          ))
        )
      ) : null}
    </div>
  );
}
