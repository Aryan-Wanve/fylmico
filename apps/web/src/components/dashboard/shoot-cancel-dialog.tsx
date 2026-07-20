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

export function ShootCancelDialog({
  open,
  onOpenChange,
  onCancel
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string, notes: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!reason.trim()) {
      setError("A cancellation reason is required.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onCancel(reason.trim(), notes.trim());
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not cancel the shoot."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cancel Shoot</DialogTitle>
          </DialogHeader>

          <label className="grid gap-1.5">
            <Label>Reason</Label>
            <textarea
              autoFocus
              className="min-h-16 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </label>

          <label className="grid gap-1.5">
            <Label>Notes (optional)</Label>
            <textarea
              className="min-h-16 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Back
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={saving}
              type="submit"
            >
              {saving ? "Cancelling..." : "Cancel Shoot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
