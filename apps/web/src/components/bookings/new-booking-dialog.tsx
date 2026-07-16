"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toISODate } from "@/lib/calendar-utils";
import type {
  CreateBookingRequest,
  Project,
  ResourceCategory
} from "@/types/base";

const RESOURCE_CATEGORIES: { value: ResourceCategory; label: string }[] = [
  { value: "studio", label: "Studio" },
  { value: "equipment", label: "Equipment" },
  { value: "venue", label: "Venue" }
];

export function NewBookingDialog({
  onCreate,
  open,
  onOpenChange,
  projects
}: {
  onCreate: (request: CreateBookingRequest) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  projects: Project[];
}) {
  const today = toISODate(new Date());
  const [resourceName, setResourceName] = useState("");
  const [resourceCategory, setResourceCategory] =
    useState<ResourceCategory>("equipment");
  const [projectId, setProjectId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setResourceName("");
    setResourceCategory("equipment");
    setProjectId("");
    setStartDate(today);
    setEndDate(today);
    setNotes("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!resourceName.trim()) {
      setError("Give the resource a name.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await onCreate({
        resourceName: resourceName.trim(),
        resourceCategory,
        projectId: projectId || undefined,
        startDate,
        endDate,
        startTime: "09:00 AM",
        endTime: "06:00 PM",
        notes: notes.trim() || undefined
      });
      reset();
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create the booking."
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
            <DialogTitle>New Booking</DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Resource name
              </Label>
              <Input
                autoFocus
                className="h-10 rounded-lg border-black/10 px-3 text-sm dark:border-white/10 dark:bg-[#11142c]"
                onChange={(event) => setResourceName(event.target.value)}
                placeholder="e.g. Studio B, RED Camera Kit"
                value={resourceName}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Category
                </Label>
                <Select
                  items={Object.fromEntries(
                    RESOURCE_CATEGORIES.map((category) => [
                      category.value,
                      category.label
                    ])
                  )}
                  onValueChange={(next) =>
                    setResourceCategory(next as ResourceCategory)
                  }
                  value={resourceCategory}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Project (optional)
                </Label>
                <Select
                  items={{
                    none: "None",
                    ...Object.fromEntries(
                      projects.map((project) => [project.id, project.title])
                    )
                  }}
                  onValueChange={(next) =>
                    setProjectId(next && next !== "none" ? next : "")
                  }
                  value={projectId || "none"}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Start date
                </Label>
                <DatePicker onChange={setStartDate} value={startDate} />
              </label>
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  End date
                </Label>
                <DatePicker
                  minDate={startDate}
                  onChange={setEndDate}
                  value={endDate}
                />
              </label>
            </div>

            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Notes (optional)
              </Label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Anything the team should know about this booking."
                value={notes}
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
              {saving ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
