"use client";

import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { FilesHeader } from "@/components/files/files-header";
import {
  FilesBreadcrumb,
  FilesViewControls,
  type FilesViewMode
} from "@/components/files/files-toolbar";
import { FileTreePanel } from "@/components/files/file-tree-panel";
import { FileListColumnHeader } from "@/components/files/file-list-column-header";
import { FileListRow } from "@/components/files/file-list-row";
import { FileGridCard } from "@/components/files/file-grid-card";
import { FilePreviewModal } from "@/components/files/file-preview-modal";
import { FilesEmptyState } from "@/components/files/files-empty-state";
import { StorageOverviewPanel } from "@/components/files/storage-overview-panel";
import { RecentFileActivityPanel } from "@/components/files/recent-file-activity-panel";
import { DriveConnectionBanner } from "@/components/files/drive-connection-banner";
import { UploadDestinationDialog } from "@/components/files/upload-destination-dialog";
import {
  UploadValidationDialog,
  getFileWarnings,
  type FileWarning
} from "@/components/uploads/upload-validation-dialog";
import { useUploadQueue } from "@/lib/uploads/use-upload-queue";
import { PaginationFooter } from "@/components/layout/pagination-footer";
import { usePrompt } from "@/components/ui/prompt-dialog";
import {
  addFileToPortfolio,
  createFolder,
  deleteFileEntry,
  getFileDownloadUrl,
  getFilesSummary,
  getFolderDownloadUrl,
  listFileEntries,
  resolveFileDestination
} from "@/services/base-workspace.service";
import {
  disconnectDrive,
  getDriveConnectUrl,
  getDriveStatus,
  type DriveStatus
} from "@/services/drive.service";
import type { FileEntryItem, FilesSummary, UploadCategory } from "@/types/base";

type Crumb = { id: string | null; name: string };

type PendingBatch = { parentId: string | null; category?: UploadCategory };

export function FilesPage() {
  const prompt = usePrompt();
  const { activeHouse, workspace } = useWorkspace();
  const { enqueue } = useUploadQueue();
  const isOwner =
    activeHouse?.members.find((member) => member.id === workspace.user.id)
      ?.role === "Owner";

  const [path, setPath] = useState<Crumb[]>([{ id: null, name: "All Files" }]);
  const [sensitiveView, setSensitiveView] = useState(false);
  const [entries, setEntries] = useState<FileEntryItem[]>([]);
  const [summary, setSummary] = useState<FilesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<FilesViewMode>("list");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [driveStatus, setDriveStatus] = useState<DriveStatus>({
    connected: false,
    email: null
  });
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileEntryItem | null>(null);
  const [destinationDialogOpen, setDestinationDialogOpen] = useState(false);
  const [treeRefreshToken, setTreeRefreshToken] = useState(0);
  const [validation, setValidation] = useState<{
    flagged: { file: File; warnings: FileWarning[] }[];
    batch: PendingBatch;
  } | null>(null);
  const pendingDropFiles = useRef<File[] | null>(null);

  const currentFolderId = path[path.length - 1].id;

  useEffect(() => {
    getDriveStatus()
      .then(setDriveStatus)
      .catch(() => {
        // Banner degrades to "not connected" if the status check fails.
      });

    const params = new URLSearchParams(window.location.search);
    if (params.has("driveConnected") || params.has("driveError")) {
      window.history.replaceState(null, "", window.location.pathname);
      if (params.has("driveError")) {
        window.alert(
          "Could not connect Google Drive. Please try again and accept all requested permissions."
        );
      }
    }

    // Deep link from elsewhere in the app (e.g. an edit task's HUD linking
    // to its raw-footage folder) - jump straight into that folder instead
    // of the full ancestor breadcrumb, which we'd otherwise have to fetch.
    const folderId = params.get("folder");
    if (folderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a one-time deep-link target from the URL on mount, not deriving render output
      setPath([
        { id: null, name: "All Files" },
        { id: folderId, name: params.get("name") || "Folder" }
      ]);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleConnectDrive() {
    try {
      const url = await getDriveConnectUrl();
      window.location.href = url;
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not start the Google Drive connection."
      );
    }
  }

  async function handleDisconnectDrive() {
    if (
      !window.confirm(
        "Disconnect Google Drive? Files already uploaded will stay in your Drive, but you won't be able to upload or download through Fylmico until you reconnect."
      )
    ) {
      return;
    }

    try {
      await disconnectDrive();
      setDriveStatus({ connected: false, email: null });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not disconnect Drive."
      );
    }
  }

  useEffect(() => {
    let cancelled = false;

    listFileEntries(currentFolderId, sensitiveView)
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error ? error.message : "Could not load files."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentFolderId, sensitiveView]);

  function handleToggleSensitive() {
    setSensitiveView((current) => !current);
    setPath([{ id: null, name: sensitiveView ? "All Files" : "Sensitive" }]);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;

    getFilesSummary()
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
        }
      })
      .catch(() => {
        // Storage panels fail quietly.
      });

    return () => {
      cancelled = true;
    };
  }, [entries]);

  const totalPages = Math.max(1, Math.ceil(entries.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = entries.slice((safePage - 1) * perPage, safePage * perPage);

  function handleNavigate(id: string | null) {
    const index = path.findIndex((crumb) => crumb.id === id);
    if (index >= 0) {
      setPath(path.slice(0, index + 1));
      setPage(1);
    }
  }

  function handleOpenEntry(entry: FileEntryItem) {
    if (entry.type === "folder") {
      setPath((current) => [...current, { id: entry.id, name: entry.name }]);
      setPage(1);
    } else {
      setPreviewFile(entry);
    }
  }

  async function handleNewFolder() {
    const name = await prompt("New folder — enter a name");
    if (!name || !name.trim()) {
      return;
    }

    try {
      const folder = await createFolder(name.trim(), currentFolderId);
      setEntries((current) => [folder, ...current]);
      setTreeRefreshToken((current) => current + 1);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the folder."
      );
    }
  }

  async function promptAddToPortfolio(entryId: string) {
    if (!window.confirm("Add this to the House Portfolio?")) {
      return;
    }
    const category = await prompt(
      "Portfolio category (Commercials/Reels/Films/Photography/Misc)",
      "Misc"
    );
    try {
      await addFileToPortfolio(entryId, category?.trim() || "Misc");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not add this to the Portfolio."
      );
    }
  }

  function enqueueBatch(files: File[], batch: PendingBatch) {
    const label =
      batch.parentId === currentFolderId ? path[path.length - 1].name : "Files";
    for (const file of files) {
      enqueue(
        file,
        { parentId: batch.parentId, label: `Files — ${label}` },
        (uploaded) => {
          if (batch.parentId === currentFolderId) {
            setEntries((current) => [uploaded, ...current]);
          }
          if (batch.category === "deliverables") {
            void promptAddToPortfolio(uploaded.id);
          }
        }
      );
    }
  }

  function beginUploadBatch(files: File[], batch: PendingBatch) {
    const existingNames =
      batch.parentId === currentFolderId
        ? entries.map((entry) => entry.name)
        : [];
    const flagged: { file: File; warnings: FileWarning[] }[] = [];
    const clean: File[] = [];
    for (const file of files) {
      const warnings = getFileWarnings(file, existingNames);
      if (warnings.length > 0) {
        flagged.push({ file, warnings });
      } else {
        clean.push(file);
      }
    }
    if (clean.length > 0) {
      enqueueBatch(clean, batch);
    }
    if (flagged.length > 0) {
      setValidation({ flagged, batch });
    }
  }

  async function handleFolderUpload(
    files: File[],
    rootParentId: string | null,
    category?: UploadCategory
  ) {
    const folderIds = new Map<string, Promise<string | null>>();

    function resolveFolder(pathParts: string[]): Promise<string | null> {
      if (pathParts.length === 0) {
        return Promise.resolve(rootParentId);
      }
      const key = pathParts.join("/");
      let pending = folderIds.get(key);
      if (!pending) {
        pending = (async () => {
          const parentId = await resolveFolder(pathParts.slice(0, -1));
          const folder = await createFolder(
            pathParts[pathParts.length - 1],
            parentId
          );
          return folder.id;
        })();
        folderIds.set(key, pending);
      }
      return pending;
    }

    try {
      for (const file of files) {
        const relativePath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name;
        const parts = relativePath.split("/");
        const parentId = await resolveFolder(parts.slice(0, -1));
        beginUploadBatch([file], { parentId, category });
      }
      setTreeRefreshToken((current) => current + 1);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not recreate this folder's structure."
      );
    }
  }

  function startUpload(
    targetParentId: string | null,
    category?: UploadCategory
  ) {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      if (files.length === 0) return;
      beginUploadBatch(files, { parentId: targetParentId, category });
    };
    input.click();
  }

  function startFolderUpload(
    targetParentId: string | null,
    category?: UploadCategory
  ) {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    (input as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory =
      true;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      if (files.length === 0) return;
      void handleFolderUpload(files, targetParentId, category);
    };
    input.click();
  }

  function handleUpload() {
    if (!driveStatus.connected) {
      window.alert("Connect your Google Drive before uploading files.");
      return;
    }

    if (!sensitiveView && currentFolderId === null) {
      pendingDropFiles.current = null;
      setDestinationDialogOpen(true);
      return;
    }

    startUpload(currentFolderId);
  }

  function handleUploadFolder() {
    if (!driveStatus.connected) {
      window.alert("Connect your Google Drive before uploading files.");
      return;
    }
    if (!sensitiveView && currentFolderId === null) {
      window.alert("Open (or create) a folder first, then upload into it.");
      return;
    }
    startFolderUpload(currentFolderId);
  }

  function handleFilesDropped(files: File[]) {
    if (files.length === 0) return;
    if (!driveStatus.connected) {
      window.alert("Connect your Google Drive before uploading files.");
      return;
    }
    if (!sensitiveView && currentFolderId === null) {
      pendingDropFiles.current = files;
      setDestinationDialogOpen(true);
      return;
    }
    beginUploadBatch(files, { parentId: currentFolderId });
  }

  async function handleConfirmDestination(destination: {
    ownerType: "project" | "client";
    ownerId: string;
    category: UploadCategory;
  }) {
    try {
      const { parentId } = await resolveFileDestination(destination);
      setTreeRefreshToken((current) => current + 1);
      if (pendingDropFiles.current) {
        beginUploadBatch(pendingDropFiles.current, {
          parentId,
          category: destination.category
        });
        pendingDropFiles.current = null;
      } else {
        startUpload(parentId, destination.category);
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not resolve where to upload this file."
      );
    }
  }

  async function handleDelete(entryId: string) {
    if (!window.confirm("Delete this item? This cannot be undone.")) {
      return;
    }

    try {
      await deleteFileEntry(entryId);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      setTreeRefreshToken((current) => current + 1);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete this item."
      );
    }
  }

  async function handleDownload(entryId: string) {
    try {
      const url = await getFileDownloadUrl(entryId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not generate a download link."
      );
    }
  }

  async function handleDownloadFolder(entryId: string) {
    try {
      const url = await getFolderDownloadUrl(entryId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not generate a download link."
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <FilesHeader
        onNewFolder={handleNewFolder}
        onToggleSensitive={handleToggleSensitive}
        onUpload={handleUpload}
        onUploadFolder={handleUploadFolder}
        sensitiveView={sensitiveView}
        showSensitiveToggle={isOwner}
      />

      <DriveConnectionBanner
        canManage={isOwner}
        onConnect={handleConnectDrive}
        onDisconnect={handleDisconnectDrive}
        status={driveStatus}
      />

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[16rem_1fr_20rem]">
        <div className="grid min-h-0 content-start gap-4">
          <FileTreePanel
            activeFolderId={currentFolderId}
            onNavigate={(nextPath) => {
              setPath(nextPath);
              setPage(1);
            }}
            refreshToken={treeRefreshToken}
            sensitiveView={sensitiveView}
          />
        </div>

        <div
          className={`grid min-w-0 grid-cols-1 content-start gap-4 rounded-2xl transition-colors ${
            dragOver
              ? "bg-[var(--fylmico-accent)]/[0.03] outline outline-2 -outline-offset-2 outline-[var(--fylmico-accent)]"
              : ""
          }`}
          onDragLeave={(event) => {
            if (event.currentTarget === event.target) {
              setDragOver(false);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            handleFilesDropped(Array.from(event.dataTransfer.files));
          }}
        >
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <FilesBreadcrumb onNavigate={handleNavigate} path={path} />
            <FilesViewControls
              onViewModeChange={setViewMode}
              viewMode={viewMode}
            />
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-[#667085] dark:text-[#7d8299]">
              Loading files...
            </p>
          ) : paginated.length === 0 ? (
            <FilesEmptyState />
          ) : viewMode === "list" ? (
            <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
              <div className="min-w-[36rem]">
                <FileListColumnHeader />
                {paginated.map((entry) => (
                  <FileListRow
                    file={entry}
                    key={entry.id}
                    onDelete={() => handleDelete(entry.id)}
                    onDownload={
                      entry.type === "file"
                        ? () => handleDownload(entry.id)
                        : () => handleDownloadFolder(entry.id)
                    }
                    onOpen={() => handleOpenEntry(entry)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {paginated.map((entry) => (
                <FileGridCard
                  file={entry}
                  key={entry.id}
                  onDelete={() => handleDelete(entry.id)}
                  onDownload={
                    entry.type === "file"
                      ? () => handleDownload(entry.id)
                      : () => handleDownloadFolder(entry.id)
                  }
                  onOpen={() => handleOpenEntry(entry)}
                />
              ))}
            </div>
          )}

          {entries.length > 0 ? (
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

        <aside className="grid min-w-0 grid-cols-1 content-start gap-6">
          <StorageOverviewPanel summary={summary} />
          <RecentFileActivityPanel summary={summary} />
        </aside>
      </div>

      <UploadDestinationDialog
        onConfirm={handleConfirmDestination}
        onOpenChange={setDestinationDialogOpen}
        open={destinationDialogOpen}
      />

      <UploadValidationDialog
        flagged={validation?.flagged ?? []}
        onConfirm={(files) => {
          if (validation) {
            enqueueBatch(files, validation.batch);
          }
          setValidation(null);
        }}
        onOpenChange={(open) => {
          if (!open) setValidation(null);
        }}
        open={validation !== null}
      />

      {previewFile ? (
        <FilePreviewModal
          file={previewFile}
          onDownload={handleDownload}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewFile(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
