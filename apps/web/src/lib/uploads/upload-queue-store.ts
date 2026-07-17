import {
  initiateFileUpload,
  updateFileMetadata
} from "@/services/base-workspace.service";
import type { FileEntryItem } from "@/types/base";
import {
  getUploadStatus,
  startResumableUpload,
  UploadSessionExpiredError,
  type UploadEngineHandle
} from "./upload-engine";

export type UploadItemStatus =
  | "queued"
  | "uploading"
  | "paused"
  | "waiting-for-connection"
  | "needs-reselect"
  | "done"
  | "error";

export type UploadDestination = {
  parentId: string | null;
  conversationId?: string;
  taskId?: string;
  label: string;
};

export type UploadQueueItem = {
  id: string;
  fileName: string;
  fileSize: number;
  destinationLabel: string;
  status: UploadItemStatus;
  loaded: number;
  speedBytesPerSec: number;
  errorMessage?: string;
};

type InternalItem = UploadQueueItem & {
  file: File | null;
  destination: UploadDestination;
  uploadToken?: string;
  handle?: UploadEngineHandle;
  onComplete?: (file: FileEntryItem) => void;
};

const STORAGE_KEY = "fylmico:upload-queue";
const MAX_CONCURRENT = 2;

const items: InternalItem[] = [];
const listeners = new Set<() => void>();

// useSyncExternalStore requires getSnapshot to return the same reference
// until the store actually changes - without this cache, toPublicItem's
// fresh array on every call reads as "changed every render" and React
// loops trying to reach a stable snapshot until it gives up with a
// "Maximum update depth exceeded" crash.
let cachedSnapshot: UploadQueueItem[] | null = null;

function notify(): void {
  cachedSnapshot = null;
  for (const listener of listeners) listener();
}

function toPublicItem(item: InternalItem): UploadQueueItem {
  return {
    id: item.id,
    fileName: item.fileName,
    fileSize: item.fileSize,
    destinationLabel: item.destinationLabel,
    status: item.status,
    loaded: item.loaded,
    speedBytesPerSec: item.speedBytesPerSec,
    errorMessage: item.errorMessage
  };
}

function persist(): void {
  try {
    const persisted = items
      .filter((item) => item.uploadToken && item.status !== "done" && item.file)
      .map((item) => ({
        id: item.id,
        fileName: item.fileName,
        fileSize: item.fileSize,
        destinationLabel: item.destinationLabel,
        uploadToken: item.uploadToken,
        loaded: item.loaded
      }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Best-effort - losing the persisted queue just means no abandoned-
    // session recovery banner next time, not a functional failure now.
  }
}

// On module load (client-side only), surface any uploads that were still
// in flight the last time this tab/page was open - the File object itself
// can't survive a reload, so these show up as "needs-reselect" rather than
// resuming automatically. This is the app's answer to "preserve the queue
// after refresh": the queue's metadata survives, even though the bytes
// don't, and re-picking the same file skips already-uploaded bytes instead
// of restarting at 0%.
function restoreAbandonedSessions(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const persisted = JSON.parse(raw) as Array<{
      id: string;
      fileName: string;
      fileSize: number;
      destinationLabel: string;
      uploadToken: string;
      loaded: number;
    }>;
    for (const entry of persisted) {
      items.push({
        id: entry.id,
        fileName: entry.fileName,
        fileSize: entry.fileSize,
        destinationLabel: entry.destinationLabel,
        status: "needs-reselect",
        loaded: entry.loaded,
        speedBytesPerSec: 0,
        file: null,
        destination: { parentId: null, label: entry.destinationLabel },
        uploadToken: entry.uploadToken
      });
    }
  } catch {
    // Corrupt localStorage entry - ignore, nothing to recover.
  }
}
restoreAbandonedSessions();

export function subscribeUploadQueue(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUploadQueueSnapshot(): UploadQueueItem[] {
  if (!cachedSnapshot) {
    cachedSnapshot = items.map(toPublicItem);
  }
  return cachedSnapshot;
}

function pump(): void {
  const uploading = items.filter((item) => item.status === "uploading");
  if (uploading.length >= MAX_CONCURRENT) return;

  const next = items.find((item) => item.status === "queued");
  if (!next) return;

  void beginUpload(next);
}

async function beginUpload(item: InternalItem): Promise<void> {
  if (!item.file) return;
  item.status = "uploading";
  notify();

  try {
    if (!item.uploadToken) {
      const { uploadToken } = await initiateFileUpload(
        item.destination.parentId,
        {
          name: item.file.name,
          mimeType: item.file.type || "application/octet-stream",
          size: item.file.size
        },
        {
          conversationId: item.destination.conversationId,
          taskId: item.destination.taskId
        }
      );
      item.uploadToken = uploadToken;
      persist();
    }

    const handle = startResumableUpload(
      item.file,
      item.uploadToken,
      (info) => {
        item.loaded = info.loaded;
        item.speedBytesPerSec = info.speedBytesPerSec;
        notify();
      },
      item.loaded
    );
    item.handle = handle;

    const file = await handle.promise;
    item.status = "done";
    item.loaded = item.fileSize;
    notify();
    void captureVideoMetadata(item.file, file);
    item.onComplete?.(file);
    persist();
    window.setTimeout(() => {
      const index = items.indexOf(item);
      if (index !== -1 && items[index].status === "done") {
        items.splice(index, 1);
        notify();
      }
    }, 5000);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      // Paused - status already set by pauseUpload(), nothing else to do.
      notify();
      return;
    }
    if (!navigator.onLine) {
      item.status = "waiting-for-connection";
      item.errorMessage = undefined;
      notify();
      window.addEventListener(
        "online",
        () => {
          if (item.status === "waiting-for-connection") {
            item.status = "queued";
            notify();
            pump();
          }
        },
        { once: true }
      );
      return;
    }
    if (error instanceof UploadSessionExpiredError) {
      item.status = "error";
      item.errorMessage =
        "This upload session expired. Restart the upload to try again.";
      item.uploadToken = undefined;
      persist();
      notify();
      return;
    }
    item.status = "error";
    item.errorMessage =
      error instanceof Error ? error.message : "This upload failed.";
    notify();
  } finally {
    persist();
    pump();
  }
}

async function captureVideoMetadata(
  localFile: File,
  entry: FileEntryItem
): Promise<void> {
  if (!localFile.type.startsWith("video/")) return;
  try {
    const url = URL.createObjectURL(localFile);
    const metadata = await new Promise<{
      durationSeconds: number;
      width: number;
      height: number;
    } | null>((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({
          durationSeconds: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
      video.onerror = () => resolve(null);
      video.src = url;
    });
    URL.revokeObjectURL(url);
    if (metadata && Number.isFinite(metadata.durationSeconds)) {
      await updateFileMetadata(entry.id, metadata);
    }
  } catch {
    // Best-effort - the file itself already uploaded successfully.
  }
}

export function enqueueUpload(
  file: File,
  destination: UploadDestination,
  onComplete?: (file: FileEntryItem) => void
): string {
  const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  items.push({
    id,
    fileName: file.name,
    fileSize: file.size,
    destinationLabel: destination.label,
    status: "queued",
    loaded: 0,
    speedBytesPerSec: 0,
    file,
    destination,
    onComplete
  });
  notify();
  pump();
  return id;
}

export function pauseUpload(id: string): void {
  const item = items.find((entry) => entry.id === id);
  if (!item || item.status !== "uploading") return;
  item.status = "paused";
  item.handle?.pause();
  notify();
}

export function resumeUpload(id: string): void {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  if (item.status === "paused" && item.handle) {
    item.status = "uploading";
    item.handle.resume();
    notify();
    return;
  }
  if (item.status === "error" || item.status === "waiting-for-connection") {
    item.status = "queued";
    notify();
    pump();
  }
}

export function cancelUpload(id: string): void {
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) return;
  items[index].handle?.cancel();
  items.splice(index, 1);
  persist();
  notify();
  pump();
}

export function reorderUpload(id: string, direction: "up" | "down"): void {
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) return;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return;
  [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
  notify();
}

// For a "needs-reselect" item recovered after a reload: the user re-picks
// the same file, and instead of restarting at 0% we ask Drive how many
// bytes it already has and resume from there.
export async function reattachUpload(id: string, file: File): Promise<void> {
  const item = items.find((entry) => entry.id === id);
  if (!item || !item.uploadToken) return;

  item.file = file;
  item.status = "queued";
  notify();

  try {
    const status = await getUploadStatus(item.uploadToken);
    item.loaded =
      status.status === "complete" ? item.fileSize : status.receivedBytes;
  } catch {
    item.loaded = 0;
    item.uploadToken = undefined;
  }
  notify();
  pump();
}
