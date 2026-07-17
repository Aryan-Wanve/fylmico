"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [codec, setCodec] = useState("");
  const [frameRate, setFrameRate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handlePick(picked: File | undefined) {
    if (picked) {
      setFile(picked);
    }
  }

  async function handleSubmit() {
    if (!file) return;
    setSubmitting(true);
    try {
      const uploaded = await uploadTaskAttachment(taskId, file);
      if (projectId) {
        try {
          const exportSettings: Record<string, string> = {};
          if (resolution.trim()) exportSettings.Resolution = resolution.trim();
          if (codec.trim()) exportSettings.Codec = codec.trim();
          if (frameRate.trim()) exportSettings["Frame Rate"] = frameRate.trim();

          await createDeliverable(projectId, {
            fileEntryId: uploaded.id,
            taskId,
            notes: notes.trim() || undefined,
            exportSettings:
              Object.keys(exportSettings).length > 0
                ? exportSettings
                : undefined
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
      setSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Draft (v{nextVersion})</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <label
            className={`grid cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center ${
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
              handlePick(event.dataTransfer.files?.[0]);
            }}
          >
            <Upload className="h-6 w-6 text-[#654cff]" />
            <span className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              {file ? file.name : "Drag & drop or click to browse"}
            </span>
            <input
              className="hidden"
              disabled={submitting}
              onChange={(event) => handlePick(event.target.files?.[0])}
              type="file"
            />
          </label>

          <label className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Notes (optional)
            </Label>
            <textarea
              className="min-h-16 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What changed in this version?"
              value={notes}
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="grid gap-1.5">
              <Label className="text-xs font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Resolution
              </Label>
              <Input
                onChange={(event) => setResolution(event.target.value)}
                placeholder="1920x1080"
                value={resolution}
              />
            </label>
            <label className="grid gap-1.5">
              <Label className="text-xs font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Codec
              </Label>
              <Input
                onChange={(event) => setCodec(event.target.value)}
                placeholder="H.264"
                value={codec}
              />
            </label>
            <label className="grid gap-1.5">
              <Label className="text-xs font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Frame Rate
              </Label>
              <Input
                onChange={(event) => setFrameRate(event.target.value)}
                placeholder="24fps"
                value={frameRate}
              />
            </label>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!file || submitting}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
