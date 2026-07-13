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
import {
  PROJECT_TYPES,
  STAGE_BADGE_STYLES
} from "@/components/projects/project-data";
import type {
  Project,
  ProjectStage,
  ProjectType,
  UpdateProjectRequest
} from "@/types/base";

const PROJECT_STAGES = Object.keys(STAGE_BADGE_STYLES) as ProjectStage[];

const selectClassName =
  "h-10 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]";

export function ProjectEditDialog({
  project,
  open,
  onOpenChange,
  onSave
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (request: UpdateProjectRequest) => Promise<void>;
}) {
  const [name, setName] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [type, setType] = useState<ProjectType | "">(project.type ?? "");
  const [genre, setGenre] = useState(project.genre ?? "");
  const [stage, setStage] = useState<ProjectStage>(project.stage);
  const [progress, setProgress] = useState(project.progress);
  const [dueDate, setDueDate] = useState(project.dueDate ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Give the project a name.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        type: type || undefined,
        genre: genre.trim(),
        stage,
        progress,
        dueDate: dueDate || undefined
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save the project."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Name
              </Label>
              <Input
                autoFocus
                className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>

            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Description
              </Label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Type
                </Label>
                <select
                  className={selectClassName}
                  onChange={(event) =>
                    setType(event.target.value as ProjectType | "")
                  }
                  value={type}
                >
                  <option value="">None</option>
                  {PROJECT_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Genre
                </Label>
                <Input
                  className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                  onChange={(event) => setGenre(event.target.value)}
                  value={genre}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Stage
                </Label>
                <select
                  className={selectClassName}
                  onChange={(event) =>
                    setStage(event.target.value as ProjectStage)
                  }
                  value={stage}
                >
                  {PROJECT_STAGES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Progress ({progress}%)
                </Label>
                <Input
                  className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                  max={100}
                  min={0}
                  onChange={(event) => setProgress(Number(event.target.value))}
                  type="number"
                  value={progress}
                />
              </label>
            </div>

            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Due date
              </Label>
              <Input
                className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                value={dueDate}
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
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
