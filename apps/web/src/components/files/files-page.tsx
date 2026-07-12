"use client";

import { useEffect, useState } from "react";
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
import { FilesEmptyState } from "@/components/files/files-empty-state";
import { StorageOverviewPanel } from "@/components/files/storage-overview-panel";
import { RecentFileActivityPanel } from "@/components/files/recent-file-activity-panel";
import { DriveConnectionBanner } from "@/components/files/drive-connection-banner";
import { PaginationFooter } from "@/components/layout/pagination-footer";
import {
  createFolder,
  deleteFileEntry,
  getFileDownloadUrl,
  getFilesSummary,
  listFileEntries,
  uploadFileEntry
} from "@/services/base-workspace.service";
import {
  disconnectDrive,
  getDriveConnectUrl,
  getDriveStatus,
  type DriveStatus
} from "@/services/drive.service";
import type { FileEntryItem, FilesSummary } from "@/types/base";

type Crumb = { id: string | null; name: string };

export function FilesPage() {
  const [path, setPath] = useState<Crumb[]>([{ id: null, name: "All Files" }]);
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

    listFileEntries(currentFolderId)
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
  }, [currentFolderId]);

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

  function handleOpenFolder(entry: FileEntryItem) {
    if (entry.type !== "folder") {
      return;
    }
    setPath((current) => [...current, { id: entry.id, name: entry.name }]);
    setPage(1);
  }

  async function handleNewFolder() {
    const name = window.prompt("New folder — enter a name");
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

  function handleUpload() {
    if (!driveStatus.connected) {
      window.alert("Connect your Google Drive before uploading files.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      try {
        const uploaded = await uploadFileEntry(file, currentFolderId);
        setEntries((current) => [uploaded, ...current]);
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : "Could not upload the file."
        );
      }
    };
    input.click();
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
    <div className="grid gap-6 p-8">
      <FilesHeader onNewFolder={handleNewFolder} onUpload={handleUpload} />

      <DriveConnectionBanner
        onConnect={handleConnectDrive}
        onDisconnect={handleDisconnectDrive}
        status={driveStatus}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[16rem_1fr_20rem]">
        <div className="grid min-h-0 content-start gap-4">
          <StorageUsedPanel usedBytes={summary?.usedBytes ?? 0} />
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
                    onOpen={
                      entry.type === "folder"
                        ? () => handleOpenFolder(entry)
                        : undefined
                    }
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
                  onOpen={
                    entry.type === "folder"
                      ? () => handleOpenFolder(entry)
                      : undefined
                  }
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

        <aside className="grid min-w-0 content-start gap-6">
          <StorageOverviewPanel summary={summary} />
          <RecentFileActivityPanel summary={summary} />
        </aside>
      </div>
    </div>
  );
}
