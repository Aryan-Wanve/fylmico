"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  createDeliverable,
  stopTaskTimer,
  updateTask,
  uploadTaskAttachment
} from "@/services/base-workspace.service";

export function SubmitDraftDialog({
  taskId,
  projectId,
  nextVersion,
  onOpenChange,
  onUploaded
}: {
  taskId: string;
  projectId: string | null;
  nextVersion: number;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadTaskAttachment(taskId, file);
      if (projectId) {
        try {
          await createDeliverable(projectId, {
            fileEntryId: uploaded.id,
            taskId
          });
        } catch {
          // Attachment itself succeeded - the versioned Deliverable row
          // is best-effort on top of it.
        }
      }
      try {
        await stopTaskTimer(taskId);
      } catch {
        // No running timer - fine.
      }
      await updateTask(taskId, { status: "review" });
      onUploaded();
      onOpenChange(false);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Draft (v{nextVersion})</DialogTitle>
        </DialogHeader>
        <label
          className={`grid cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed p-10 text-center ${
            dragOver
              ? "border-[#654cff] bg-[#654cff]/[0.04]"
              : "border-black/10 dark:border-white/10"
          }`}
          onDragLeave={() => setDragOver(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            void handleFile(event.dataTransfer.files?.[0]);
          }}
        >
          <Upload className="h-6 w-6 text-[#654cff]" />
          <span className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {uploading ? "Uploading..." : "Drag & drop or click to browse"}
          </span>
          <input
            className="hidden"
            disabled={uploading}
            onChange={(event) => void handleFile(event.target.files?.[0])}
            type="file"
          />
        </label>
      </DialogContent>
    </Dialog>
  );
}
