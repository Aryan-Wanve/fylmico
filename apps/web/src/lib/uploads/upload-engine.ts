import type { FileEntryItem } from "@/types/base";

// A multiple of Google Drive's required 256 KiB chunk granularity - large
// enough to keep request overhead low, small enough that a dropped
// connection mid-chunk only costs a few seconds of re-sent data once the
// status check reports how far Drive actually got.
const CHUNK_SIZE = 8 * 1024 * 1024;

export class UploadSessionExpiredError extends Error {}

type ChunkResult =
  | { status: "incomplete"; receivedBytes: number }
  | { status: "complete"; file: FileEntryItem };

function parseErrorPayload(responseText: string): string | undefined {
  try {
    const payload = JSON.parse(responseText) as {
      error?: { message?: string };
    };
    return payload.error?.message;
  } catch {
    return undefined;
  }
}

function putChunk(
  uploadToken: string,
  chunk: Blob,
  start: number,
  end: number,
  total: number,
  onLoaded: (loadedInChunk: number) => void
): { promise: Promise<ChunkResult>; abort: () => void } {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<ChunkResult>((resolve, reject) => {
    xhr.open("PUT", `/api/v1/files/upload-sessions/${uploadToken}/chunk`);
    xhr.setRequestHeader("Content-Range", `bytes ${start}-${end}/${total}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onLoaded(event.loaded);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText) as { data: ChunkResult };
          resolve(payload.data);
        } catch {
          reject(new Error("Could not parse the upload response."));
        }
        return;
      }
      const message = parseErrorPayload(xhr.responseText);
      if (xhr.status === 400 || xhr.status === 410) {
        reject(
          new UploadSessionExpiredError(
            message ?? "This upload session has expired."
          )
        );
        return;
      }
      reject(new Error(message ?? "Could not upload this chunk."));
    };
    xhr.onerror = () =>
      reject(new Error("A network error interrupted the upload."));
    xhr.onabort = () =>
      reject(new DOMException("Upload paused.", "AbortError"));
    xhr.send(chunk);
  });

  return { promise, abort: () => xhr.abort() };
}

export async function getUploadStatus(
  uploadToken: string
): Promise<ChunkResult> {
  const response = await fetch(
    `/api/v1/files/upload-sessions/${uploadToken}/status`
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 400 || response.status === 410) {
      throw new UploadSessionExpiredError(
        payload?.error?.message ?? "This upload session has expired."
      );
    }
    throw new Error(
      payload?.error?.message ?? "Could not check upload status."
    );
  }
  return payload.data as ChunkResult;
}

export type UploadProgressInfo = {
  loaded: number;
  total: number;
  speedBytesPerSec: number;
};

export type UploadEngineHandle = {
  promise: Promise<FileEntryItem>;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
};

const MAX_RETRIES_PER_CHUNK = 5;

// Uploads `file` to the Drive resumable session named by `uploadToken`,
// chunk by chunk, with pause/resume/cancel and automatic resume-after-drop
// (via getUploadStatus, so a flaky connection never restarts from 0%).
// `startOffset` lets a caller resume a session that was already partially
// uploaded in an earlier tab/page lifetime (see the queue store's
// abandoned-session recovery).
export function startResumableUpload(
  file: File,
  uploadToken: string,
  onProgress: (info: UploadProgressInfo) => void,
  startOffset = 0
): UploadEngineHandle {
  let paused = false;
  let cancelled = false;
  let currentAbort: (() => void) | null = null;
  let resumeSignal: (() => void) | null = null;

  function waitWhilePaused(): Promise<void> {
    if (!paused) return Promise.resolve();
    return new Promise((resolve) => {
      resumeSignal = resolve;
    });
  }

  async function run(): Promise<FileEntryItem> {
    const total = file.size;
    let offset = startOffset;
    const startTime = Date.now();

    while (offset < total) {
      if (cancelled) throw new DOMException("Upload cancelled.", "AbortError");
      await waitWhilePaused();
      if (cancelled) throw new DOMException("Upload cancelled.", "AbortError");

      const end = Math.min(offset + CHUNK_SIZE, total) - 1;
      const chunk = file.slice(offset, end + 1);
      const chunkStart = offset;

      let attempt = 0;
      let advanced = false;
      while (!advanced) {
        try {
          const { promise, abort } = putChunk(
            uploadToken,
            chunk,
            chunkStart,
            end,
            total,
            (loadedInChunk) => {
              const loaded = chunkStart + loadedInChunk;
              const elapsedSec = (Date.now() - startTime) / 1000;
              onProgress({
                loaded,
                total,
                speedBytesPerSec: elapsedSec > 0 ? loaded / elapsedSec : 0
              });
            }
          );
          currentAbort = abort;
          const result = await promise;
          currentAbort = null;

          if (result.status === "complete") {
            onProgress({ loaded: total, total, speedBytesPerSec: 0 });
            return result.file;
          }
          offset = result.receivedBytes;
          advanced = true;
        } catch (error) {
          currentAbort = null;
          if (error instanceof DOMException && error.name === "AbortError") {
            // Paused or cancelled mid-flight - loop back to the pause/cancel
            // checks above rather than treating this as a failure.
            advanced = true;
            break;
          }
          if (error instanceof UploadSessionExpiredError) {
            throw error;
          }

          attempt += 1;
          if (attempt > MAX_RETRIES_PER_CHUNK) {
            throw error;
          }
          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(1000 * attempt, 8000))
          );
          try {
            const status = await getUploadStatus(uploadToken);
            if (status.status === "complete") {
              onProgress({ loaded: total, total, speedBytesPerSec: 0 });
              return status.file;
            }
            offset = status.receivedBytes;
          } catch {
            // Status check itself failed (still offline) - the outer retry
            // loop will try the same chunk again after the backoff delay.
          }
        }
      }
    }

    // Reaching here without having returned means the loop believed it was
    // done sending bytes, but Drive never confirmed completion - ask once
    // more before giving up.
    const finalStatus = await getUploadStatus(uploadToken);
    if (finalStatus.status === "complete") {
      return finalStatus.file;
    }
    throw new Error("Upload did not complete - please retry.");
  }

  const promise = run();

  return {
    promise,
    pause: () => {
      paused = true;
      currentAbort?.();
    },
    resume: () => {
      paused = false;
      const signal = resumeSignal;
      resumeSignal = null;
      signal?.();
    },
    cancel: () => {
      cancelled = true;
      currentAbort?.();
      const signal = resumeSignal;
      resumeSignal = null;
      signal?.();
    }
  };
}
