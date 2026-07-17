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
import { TaskAssigneePicker } from "@/components/tasks/task-assignee-picker";
import type {
  CreateShootRequest,
  HouseMember,
  ProductionTask,
  TaskAssigneeInput
} from "@/types/base";

export function ShootCreateDialog({
  open,
  onOpenChange,
  members,
  tasks,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: HouseMember[];
  tasks: ProductionTask[];
  onSave: (request: CreateShootRequest) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [location, setLocation] = useState("");
  const [equipment, setEquipment] = useState("");
  const [notes, setNotes] = useState("");
  const [crew, setCrew] = useState<TaskAssigneeInput[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the shoot a name.");
      return;
    }
    if (!scheduledDate) {
      setError("Pick a scheduled date.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        scheduledDate: new Date(scheduledDate).toISOString(),
        callTime: callTime.trim() || undefined,
        location: location.trim() || undefined,
        equipment: equipment
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        crewIds: crew.map((assignee) => assignee.userId),
        notes: notes.trim() || undefined
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not schedule the shoot."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-xl">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule Shoot</DialogTitle>
          </DialogHeader>

          <label className="grid gap-1.5">
            <Label>Shoot Name</Label>
            <Input
              autoFocus
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <Label>Scheduled Date</Label>
              <DatePicker onChange={setScheduledDate} value={scheduledDate} />
            </label>
            <label className="grid gap-1.5">
              <Label>Call Time</Label>
              <Input
                onChange={(event) => setCallTime(event.target.value)}
                placeholder="e.g. 7:00 AM"
                value={callTime}
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <Label>Location</Label>
            <Input
              onChange={(event) => setLocation(event.target.value)}
              value={location}
            />
          </label>

          <label className="grid gap-1.5">
            <Label>Equipment (comma separated)</Label>
            <Input
              onChange={(event) => setEquipment(event.target.value)}
              placeholder="Camera, Tripod, Lights"
              value={equipment}
            />
          </label>

          <div className="grid gap-1.5">
            <Label>Crew</Label>
            <TaskAssigneePicker
              members={members}
              onChange={setCrew}
              selected={crew}
              tasks={tasks}
            />
          </div>

          <label className="grid gap-1.5">
            <Label>Notes</Label>
            <Input
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
              Cancel
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? "Scheduling..." : "Schedule Shoot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
