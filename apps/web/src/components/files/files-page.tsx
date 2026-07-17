"use client";

import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { FilesHeader } from "@/components/files/files-header";
import {
  FilesBreadcrumb,
  FilesViewControls,
  type FilesViewMode
} from "@/components/files/files-toolbar";
import { StorageUsedPanel } from "@/components/files/storage-used-panel";
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
  UploadProgressToast,
  type UploadProgressItem
} from "@/components/files/upload-progress-toast";
import { PaginationFooter } from "@/components/layout/pagination-footer";
import { usePrompt } from "@/components/ui/prompt-dialog";
import {
  addFileToPortfolio,
  createFolder,
  deleteFileEntry,
  getFileDownloadUrl,
  getFilesSummary,
  listClients,
  listFileEntries,
  listProjects,
  resolveFileDestination,
  uploadFileEntryWithProgress,
  type UploadHandle
} from "@/services/base-workspace.service";
import {
  disconnectDrive,
  getDriveConnectUrl,
  getDriveStatus,
  type DriveStatus
} from "@/services/drive.service";
import type {
  ClientItem,
  FileEntryItem,
  FilesSummary,
  Project,
  UploadCategory
} from "@/types/base";

type Crumb = { id: string | null; name: string };

export function FilesPage() {
  const prompt = usePrompt();
  const { activeHouse, workspace } = useWorkspace();
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
  const [uploads, setUploads] = useState<UploadProgressItem[]>([]);
  const [previewFile, setPreviewFile] = useState<FileEntryItem | null>(null);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [destinationDialogOpen, setDestinationDialogOpen] = useState(false);
  const uploadHandles = useRef(new Map<string, UploadHandle>());
  const uploadStartTimes = useRef(new Map<string, number>());

  const currentFolderId = path[path.length - 1].id;

  useEffect(() => {
    Promise.all([listClients(), listProjects()])
      .then(([clientList, projectList]) => {
        setClients(clientList);
        setProjects(projectList);
      })
      .catch(() => {
        // Destination picker just shows fewer options if this fails.
      });
  }, []);

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

  function startUpload(
    targetParentId: string | null,
    category?: UploadCategory
  ) {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      const uploadId = `${Date.now()}-${file.name}`;
      uploadStartTimes.current.set(uploadId, performance.now());
      setUploads((current) => [
        {
          id: uploadId,
          fileName: file.name,
          loaded: 0,
          total: file.size,
          speedBytesPerSec: 0,
          status: "uploading"
        },
        ...current
      ]);

      const handle = uploadFileEntryWithProgress(
        file,
        targetParentId,
        (loaded, total) => {
          const startedAt =
            uploadStartTimes.current.get(uploadId) ?? performance.now();
          const elapsedSeconds = (performance.now() - startedAt) / 1000;
          const speedBytesPerSec =
            elapsedSeconds > 0 ? loaded / elapsedSeconds : 0;
          setUploads((current) =>
            current.map((upload) =>
              upload.id === uploadId
                ? { ...upload, loaded, total, speedBytesPerSec }
                : upload
            )
          );
        }
      );
      uploadHandles.current.set(uploadId, handle);

      handle.promise
        .then((uploaded) => {
          if (targetParentId === currentFolderId) {
            setEntries((current) => [uploaded, ...current]);
          }
          setUploads((current) =>
            current.map((upload) =>
              upload.id === uploadId
                ? { ...upload, status: "done", loaded: upload.total }
                : upload
            )
          );
          setTimeout(() => {
            setUploads((current) =>
              current.filter((upload) => upload.id !== uploadId)
            );
          }, 4000);

          if (category === "deliverables") {
            void promptAddToPortfolio(uploaded.id);
          }
        })
        .catch((error) => {
          setUploads((current) =>
            current.map((upload) =>
              upload.id === uploadId
                ? {
                    ...upload,
                    status: "error",
                    errorMessage:
                      error instanceof Error
                        ? error.message
                        : "Could not upload the file."
                  }
                : upload
            )
          );
        })
        .finally(() => {
          uploadHandles.current.delete(uploadId);
          uploadStartTimes.current.delete(uploadId);
        });
    };
    input.click();
  }

  function handleUpload() {
    if (!driveStatus.connected) {
      window.alert("Connect your Google Drive before uploading files.");
      return;
    }

    if (!sensitiveView && currentFolderId === null) {
      setDestinationDialogOpen(true);
      return;
    }

    startUpload(currentFolderId);
  }

  async function handleConfirmDestination(destination: {
    clientId: string;
    projectId?: string;
    category: UploadCategory;
  }) {
    try {
      const { parentId } = await resolveFileDestination(destination);
      startUpload(parentId, destination.category);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not resolve where to upload this file."
      );
    }
  }

  function handleDismissUpload(uploadId: string) {
    setUploads((current) => current.filter((upload) => upload.id !== uploadId));
  }

  function handleCancelUpload(uploadId: string) {
    uploadHandles.current.get(uploadId)?.cancel();
  }

  async function handleDelete(entryId: string) {
    if (!window.confirm("Delete this item? This cannot be undone.")) {
      return;
    }

    try {
      await deleteFileEntry(entryId);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
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

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <FilesHeader
        onNewFolder={handleNewFolder}
        onToggleSensitive={handleToggleSensitive}
        onUpload={handleUpload}
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
          <StorageUsedPanel usedBytes={summary?.usedBytes ?? 0} />
        </div>

        <div className="grid min-w-0 grid-cols-1 content-start gap-4">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <FilesBreadcrumb onNavigate={handleNavigate} path={path} />
            <FilesViewControls
              onViewModeChange={setViewMode}
              viewMode={viewMode}
            />
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
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
                        : undefined
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
                      : undefined
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

      <UploadProgressToast
        onCancel={handleCancelUpload}
        onDismiss={handleDismissUpload}
        uploads={uploads}
      />

      <UploadDestinationDialog
        clients={clients}
        onConfirm={handleConfirmDestination}
        onOpenChange={setDestinationDialogOpen}
        open={destinationDialogOpen}
        projects={projects}
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
