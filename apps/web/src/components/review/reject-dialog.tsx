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

export function RejectDialog({
  open,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Submission</DialogTitle>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
            Reason for rejection
          </Label>
          <textarea
            autoFocus
            className="min-h-28 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-red-500 dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why this submission is being rejected."
            value={reason}
          />
          <p className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            This is permanent - the submission is marked Rejected and no files
            are moved. This does not affect other versions on this task.
          </p>
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
            className="bg-red-800 text-white hover:bg-red-900"
            disabled={submitting || !reason.trim()}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {submitting ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
