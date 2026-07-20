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
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  PROJECT_TYPES,
  STAGE_BADGE_STYLES
} from "@/components/projects/project-data";
import { PRIORITY_META, PRIORITY_ORDER } from "@/components/tasks/task-data";
import type {
  Project,
  ProjectStage,
  ProjectType,
  TaskPriority,
  UpdateProjectRequest
} from "@/types/base";

const PROJECT_STAGES = Object.keys(STAGE_BADGE_STYLES) as ProjectStage[];

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
  const [priority, setPriority] = useState<TaskPriority>(project.priority);
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
        priority,
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
                className="min-h-20 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Type
                </Label>
                <Select
                  items={{ none: "None" }}
                  onValueChange={(next) =>
                    setType(next === "none" ? "" : (next as ProjectType))
                  }
                  value={type || "none"}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {PROJECT_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Stage
                </Label>
                <Select
                  onValueChange={(next) => setStage(next as ProjectStage)}
                  value={stage}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STAGES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Priority
              </Label>
              <div className="flex gap-1.5">
                {PRIORITY_ORDER.map((value) => (
                  <button
                    className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                      priority === value
                        ? PRIORITY_META[value].bar + " text-white"
                        : "bg-black/[0.04] text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]"
                    }`}
                    key={value}
                    onClick={() => setPriority(value)}
                    type="button"
                  >
                    {PRIORITY_META[value].label}
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Due date
              </Label>
              <DatePicker onChange={setDueDate} value={dueDate} />
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
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
