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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { HouseMember } from "@/types/base";

export function ReassignDialog({
  open,
  onOpenChange,
  members,
  currentEditorId,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: HouseMember[];
  currentEditorId?: string;
  onSubmit: (newEditorId: string) => Promise<void>;
}) {
  const [newEditorId, setNewEditorId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const candidates = members.filter((m) => m.id !== currentEditorId);

  async function handleSubmit() {
    if (!newEditorId) return;
    setSubmitting(true);
    try {
      await onSubmit(newEditorId);
      setNewEditorId("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) setNewEditorId("");
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reassign to another editor</DialogTitle>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
            New editor
          </Label>
          <Select
            onValueChange={(next) => setNewEditorId(next ?? "")}
            value={newEditorId}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select a member..." />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-[#667085] dark:text-[#7d8299]">
            The task, all versions, comments and review history transfer to the
            new editor. Both editors are notified.
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
            disabled={submitting || !newEditorId}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {submitting ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
