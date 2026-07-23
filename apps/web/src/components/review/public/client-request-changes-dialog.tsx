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

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

export function ClientRequestChangesDialog({
  open,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    feedback: string,
    priority?: string,
    deadline?: string
  ) => Promise<void>;
}) {
  const [feedback, setFeedback] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!feedback.trim()) {
      setError("Describe what needs to change.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(feedback.trim(), priority, deadline.trim() || undefined);
      onOpenChange(false);
      setFeedback("");
      setDeadline("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit your feedback."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              What needs to change?
            </Label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Describe the changes you'd like to see..."
              value={feedback}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Priority
              </Label>
              <Select
                onValueChange={(next) => next && setPriority(next)}
                value={priority}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Deadline (optional)
              </Label>
              <input
                className="h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:text-[#f1f2f8]"
                onChange={(event) => setDeadline(event.target.value)}
                placeholder="e.g. Friday"
                value={deadline}
              />
            </div>
          </div>

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
            disabled={submitting}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {submitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
