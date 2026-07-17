"use client";

import { useSyncExternalStore } from "react";
import {
  cancelUpload,
  enqueueUpload,
  getUploadQueueSnapshot,
  pauseUpload,
  reattachUpload,
  reorderUpload,
  resumeUpload,
  subscribeUploadQueue,
  type UploadQueueItem
} from "./upload-queue-store";

const EMPTY_QUEUE: UploadQueueItem[] = [];

// The single global upload queue, reactive across every component that
// calls this hook - enqueue from the Files page, the shoot card, a task's
// attachment picker, or Submit Draft, and the same floating panel (mounted
// once in the app shell) reflects all of them, surviving navigation
// between pages since the queue lives outside any one page's React tree.
export function useUploadQueue() {
  const queue = useSyncExternalStore(
    subscribeUploadQueue,
    getUploadQueueSnapshot,
    () => EMPTY_QUEUE
  );

  return {
    queue,
    enqueue: enqueueUpload,
    pause: pauseUpload,
    resume: resumeUpload,
    cancel: cancelUpload,
    reorder: reorderUpload,
    reattach: reattachUpload
  };
}
