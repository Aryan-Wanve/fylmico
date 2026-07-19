"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function RequestChangesDialog({
  open,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (comment: string) => Promise<void>;
}) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(comment.trim());
      setComment("");
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not request changes on this submission."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
            What needs to change?
          </Label>
          <textarea
            autoFocus
            className="min-h-28 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
            onChange={(event) => setComment(event.target.value)}
            placeholder="e.g. Color grade looks too warm in the interview scene, please adjust."
            value={comment}
          />
          <p className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            This moves the task back to In Progress and notifies the editor.
          </p>
          {error ? (
            <p className="text-xs font-semibold text-red-500">{error}</p>
          ) : null}
        </div>
        <DialogFooter className="mt-3">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={submitting || !comment.trim()}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {submitting ? "Sending..." : "Request Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
