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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { CreateAnnouncementRequest } from "@/types/base";

export function NewAnnouncementDialog({
  onCreate,
  open,
  onOpenChange
}: {
  onCreate: (request: CreateAnnouncementRequest) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle("");
    setBody("");
    setPinned(false);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError("Give the announcement a title and body.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await onCreate({ title: title.trim(), body: body.trim(), pinned });
      reset();
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not post the announcement."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          reset();
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Title
              </Label>
              <Input
                autoFocus
                className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Wrap party this Friday"
                value={title}
              />
            </label>

            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Message
              </Label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
                onChange={(event) => setBody(event.target.value)}
                placeholder="Share an update with the whole house..."
                value={body}
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={pinned} onCheckedChange={setPinned} />
              <span className="font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Pin to top
              </span>
            </label>
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}

          <DialogFooter className="mt-5">
            <Button
              className="h-9 rounded-lg border-black/10 px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-lg bg-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
              disabled={saving}
              type="submit"
            >
              {saving ? "Posting..." : "Post Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
