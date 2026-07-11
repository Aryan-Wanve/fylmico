"use client";

import { useState } from "react";
import { FilesHeader } from "@/components/files/files-header";
import {
  FilesBreadcrumb,
  FilesToolbar,
  FilesViewControls,
  type FilesTab,
  type FilesViewMode
} from "@/components/files/files-toolbar";
import { FoldersPanel } from "@/components/files/folders-panel";
import { StorageUsedPanel } from "@/components/files/storage-used-panel";
import { FileListColumnHeader } from "@/components/files/file-list-column-header";
import { FileListRow } from "@/components/files/file-list-row";
import { FileGridCard } from "@/components/files/file-grid-card";
import { FilesEmptyState } from "@/components/files/files-empty-state";
import { StorageOverviewPanel } from "@/components/files/storage-overview-panel";
import { RecentFileActivityPanel } from "@/components/files/recent-file-activity-panel";
import { QuickAccessPanel } from "@/components/files/quick-access-panel";
import { PaginationFooter } from "@/components/layout/pagination-footer";
import {
  FILE_CONTENT,
  FOLDER_PATHS,
  sharedWithMeFiles,
  trashFiles,
  type FileEntry
} from "@/components/files/file-data";

export function FilesPage() {
  const [activeTab, setActiveTab] = useState<FilesTab>("all");
  const [viewMode, setViewMode] = useState<FilesViewMode>("list");
  const [selectedFolderId, setSelectedFolderId] = useState("day-2");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(["beyond-frames", "production"])
  );
  const [fileOverrides, setFileOverrides] = useState<
    Record<string, FileEntry[]>
  >({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  function toggleExpand(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectFolder(id: string) {
    setSelectedFolderId(id);
    setActiveTab("all");
    setPage(1);
  }

  const baseFiles: FileEntry[] =
    activeTab === "shared"
      ? sharedWithMeFiles
      : activeTab === "trash"
        ? trashFiles
        : (fileOverrides[selectedFolderId] ??
          FILE_CONTENT[selectedFolderId] ??
          []);

  const visibleFiles = baseFiles.filter((file) => !removedIds.has(file.id));

  const totalPages = Math.max(1, Math.ceil(visibleFiles.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = visibleFiles.slice(
    (safePage - 1) * perPage,
    safePage * perPage
  );

  function handleDelete(fileId: string) {
    setRemovedIds((current) => new Set(current).add(fileId));
  }

  function handleUpload() {
    const name = window.prompt("Upload file — enter a file name");

    if (!name || !name.trim()) {
      return;
    }

    const file: FileEntry = {
      id: `upload-${Date.now()}`,
      name: name.trim(),
      kind: "other",
      size: "0 KB",
      modified: "Just now",
      modifiedBy: "aryan"
    };

    setFileOverrides((current) => ({
      ...current,
      [selectedFolderId]: [
        file,
        ...(current[selectedFolderId] ?? FILE_CONTENT[selectedFolderId] ?? [])
      ]
    }));
  }

  function handleNewFolder() {
    const name = window.prompt("New folder — enter a name");

    if (!name || !name.trim()) {
      return;
    }

    const folder: FileEntry = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      kind: "folder",
      itemCount: 0,
      modified: "Just now",
      modifiedBy: "aryan"
    };

    setFileOverrides((current) => ({
      ...current,
      [selectedFolderId]: [
        folder,
        ...(current[selectedFolderId] ?? FILE_CONTENT[selectedFolderId] ?? [])
      ]
    }));
  }

  const breadcrumbPath = FOLDER_PATHS[selectedFolderId] ?? ["Beyond Frames"];

  const tabCounts: Record<FilesTab, string> = {
    all: "1.2K",
    shared: String(sharedWithMeFiles.length > 0 ? 86 : 0),
    trash: String(trashFiles.length)
  };

  return (
    <div className="grid gap-6 p-8">
      <FilesHeader onNewFolder={handleNewFolder} onUpload={handleUpload} />
      <FilesToolbar
        activeTab={activeTab}
        counts={tabCounts}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[16rem_1fr_20rem]">
        <div className="grid min-h-0 content-start gap-4">
          <FoldersPanel
            expandedIds={expandedIds}
            onNewFolder={() => {
              const name = window.prompt("New top-level folder name");
              if (name && name.trim()) {
                window.alert(
                  `"${name.trim()}" would be created as a new top-level folder.`
                );
              }
            }}
            onSelect={handleSelectFolder}
            onToggleExpand={toggleExpand}
            selectedId={selectedFolderId}
          />
          <StorageUsedPanel />
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {activeTab === "all" ? (
              <FilesBreadcrumb path={breadcrumbPath} />
            ) : (
              <strong className="text-sm font-bold text-[#11142c]">
                {activeTab === "shared" ? "Shared with me" : "Trash"}
              </strong>
            )}
            <FilesViewControls
              onViewModeChange={setViewMode}
              viewMode={viewMode}
            />
          </div>

          {paginated.length === 0 ? (
            <FilesEmptyState />
          ) : viewMode === "list" ? (
            <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
              <div className="min-w-[36rem]">
                <FileListColumnHeader />
                {paginated.map((file) => (
                  <FileListRow
                    file={file}
                    key={file.id}
                    onDelete={() => handleDelete(file.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {paginated.map((file) => (
                <FileGridCard
                  file={file}
                  key={file.id}
                  onDelete={() => handleDelete(file.id)}
                />
              ))}
            </div>
          )}

          {visibleFiles.length > 0 ? (
            <PaginationFooter
              onPageChange={setPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              page={safePage}
              perPage={perPage}
              totalPages={totalPages}
            />
          ) : null}
        </div>

        <aside className="grid min-w-0 content-start gap-6">
          <StorageOverviewPanel />
          <RecentFileActivityPanel />
          <QuickAccessPanel />
        </aside>
      </div>
    </div>
  );
}
