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
import { toISODate } from "@/lib/calendar-utils";
import type { CreateCallSheetRequest, Project } from "@/types/base";

const selectClassName =
  "h-10 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]";

export function NewCallSheetDialog({
  onCreate,
  open,
  onOpenChange,
  projects
}: {
  onCreate: (request: CreateCallSheetRequest) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  projects: Project[];
}) {
  const today = toISODate(new Date());
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [shootDate, setShootDate] = useState(today);
  const [generalCallTime, setGeneralCallTime] = useState("6:00 AM");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle("");
    setProjectId("");
    setShootDate(today);
    setGeneralCallTime("6:00 AM");
    setLocation("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Give the call sheet a title.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await onCreate({
        title: title.trim(),
        projectId: projectId || undefined,
        shootDate,
        generalCallTime: generalCallTime.trim() || "6:00 AM",
        location: location.trim() || undefined
      });
      reset();
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create the call sheet."
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
            <DialogTitle>New Call Sheet</DialogTitle>
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
                placeholder="e.g. Day 4 - Harbor Exteriors"
                value={title}
              />
            </label>

            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Project (optional)
              </Label>
              <select
                className={selectClassName}
                onChange={(event) => setProjectId(event.target.value)}
                value={projectId}
              >
                <option value="">None</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Shoot date
                </Label>
                <Input
                  className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                  onChange={(event) => setShootDate(event.target.value)}
                  type="date"
                  value={shootDate}
                />
              </label>
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  General call time
                </Label>
                <Input
                  className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                  onChange={(event) => setGeneralCallTime(event.target.value)}
                  placeholder="6:00 AM"
                  value={generalCallTime}
                />
              </label>
            </div>

            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Location (optional)
              </Label>
              <Input
                className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Harbor Pier 4"
                value={location}
              />
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
              className="h-9 rounded-lg bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
              disabled={saving}
              type="submit"
            >
              {saving ? "Creating..." : "Create Call Sheet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
