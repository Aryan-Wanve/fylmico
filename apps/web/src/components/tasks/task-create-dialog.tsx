"use client";

import { useEffect, useState } from "react";
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
import { TaskAssigneePicker } from "@/components/tasks/task-assignee-picker";
import { TaskDescriptionEditor } from "@/components/tasks/task-description-editor";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  TASK_TYPE_LABELS,
  TASK_TYPES
} from "@/components/tasks/task-data";
import {
  listBoards,
  listCalendarEvents,
  listProjects,
  listScripts
} from "@/services/base-workspace.service";
import type {
  Board,
  CalendarEvent,
  CreateTaskRequest,
  HouseMember,
  ProductionTask,
  Project,
  ScriptSummary,
  TaskAssigneeInput,
  TaskPriority,
  TaskType
} from "@/types/base";

const selectClassName =
  "h-10 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]";

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TaskCreateDialog({
  open,
  onOpenChange,
  members,
  tasks,
  defaultAssigneeId,
  onCreate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: HouseMember[];
  tasks: ProductionTask[];
  defaultAssigneeId?: string;
  onCreate: (request: CreateTaskRequest) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("custom");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignees, setAssignees] = useState<TaskAssigneeInput[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState<
    "" | "daily" | "weekly" | "monthly"
  >("");
  const [projectId, setProjectId] = useState("");
  const [boardId, setBoardId] = useState("");
  const [scriptId, setScriptId] = useState("");
  const [shootDayEventId, setShootDayEventId] = useState("");
  const [equipment, setEquipment] = useState("");
  const [location, setLocation] = useState("");
  const [callTime, setCallTime] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [scripts, setScripts] = useState<ScriptSummary[]>([]);
  const [shootEvents, setShootEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting form state each time the dialog re-opens, not deriving render output
    setAssignees(defaultAssigneeId ? [{ userId: defaultAssigneeId }] : []);
    Promise.all([
      listProjects(),
      listBoards(),
      listScripts(),
      listCalendarEvents()
    ])
      .then(([projectList, boardList, scriptList, eventList]) => {
        setProjects(projectList);
        setBoards(boardList);
        setScripts(scriptList);
        setShootEvents(eventList.filter((event) => event.category === "shoot"));
      })
      .catch(() => {
        // Link pickers just show fewer options if this fails.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function reset() {
    setTitle("");
    setDescription("");
    setType("custom");
    setPriority("medium");
    setAssignees([]);
    setDueDate("");
    setStartDate("");
    setEstimatedMinutes("");
    setRecurrenceRule("");
    setProjectId("");
    setBoardId("");
    setScriptId("");
    setShootDayEventId("");
    setEquipment("");
    setLocation("");
    setCallTime("");
    setDeliverables("");
    setTags("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the task a title.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        priority,
        assignees: assignees.length ? assignees : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        estimatedMinutes: estimatedMinutes
          ? Number(estimatedMinutes)
          : undefined,
        recurrenceRule: recurrenceRule || undefined,
        projectId: projectId || undefined,
        boardId: boardId || undefined,
        scriptId: scriptId || undefined,
        shootDayEventId: shootDayEventId || undefined,
        equipment: equipment ? splitTags(equipment) : undefined,
        location: location.trim() || undefined,
        callTime: callTime.trim() || undefined,
        deliverables: deliverables ? splitTags(deliverables) : undefined,
        tags: tags ? splitTags(tags) : undefined
      });
      reset();
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create the task."
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
      <DialogContent className="max-w-2xl">
        <form
          className="grid max-h-[80vh] gap-5 overflow-y-auto pr-1"
          onSubmit={handleSubmit}
        >
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>

          <label className="grid gap-1.5">
            <Label>Title</Label>
            <Input
              autoFocus
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Color grade the interview scene"
              value={title}
            />
          </label>

          <label className="grid gap-1.5">
            <Label>Description</Label>
            <TaskDescriptionEditor
              onChange={setDescription}
              value={description}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <Label>Type</Label>
              <select
                className={selectClassName}
                onChange={(event) => setType(event.target.value as TaskType)}
                value={type}
              >
                {TASK_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {TASK_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <Label>Priority</Label>
              <select
                className={selectClassName}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
                value={priority}
              >
                {PRIORITY_ORDER.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_META[value].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-1.5">
            <Label>Assign to</Label>
            <TaskAssigneePicker
              members={members}
              onChange={setAssignees}
              selected={assignees}
              tasks={tasks}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <Label>Due date &amp; time</Label>
              <Input
                onChange={(event) => setDueDate(event.target.value)}
                type="datetime-local"
                value={dueDate}
              />
            </label>
            <label className="grid gap-1.5">
              <Label>Start date</Label>
              <Input
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                value={startDate}
              />
            </label>
            <label className="grid gap-1.5">
              <Label>Estimated duration (minutes)</Label>
              <Input
                onChange={(event) => setEstimatedMinutes(event.target.value)}
                type="number"
                value={estimatedMinutes}
              />
            </label>
            <label className="grid gap-1.5">
              <Label>Repeats</Label>
              <select
                className={selectClassName}
                onChange={(event) =>
                  setRecurrenceRule(
                    event.target.value as "" | "daily" | "weekly" | "monthly"
                  )
                }
                value={recurrenceRule}
              >
                <option value="">Doesn&apos;t repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <Label>Location</Label>
              <Input
                onChange={(event) => setLocation(event.target.value)}
                value={location}
              />
            </label>
            <label className="grid gap-1.5">
              <Label>Call time</Label>
              <Input
                onChange={(event) => setCallTime(event.target.value)}
                placeholder="7:00 AM"
                value={callTime}
              />
            </label>
            <label className="col-span-2 grid gap-1.5">
              <Label>Equipment (comma-separated)</Label>
              <Input
                onChange={(event) => setEquipment(event.target.value)}
                value={equipment}
              />
            </label>
            <label className="col-span-2 grid gap-1.5">
              <Label>Deliverables (comma-separated)</Label>
              <Input
                onChange={(event) => setDeliverables(event.target.value)}
                value={deliverables}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <Label>Project</Label>
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
            <label className="grid gap-1.5">
              <Label>Storyboard</Label>
              <select
                className={selectClassName}
                onChange={(event) => setBoardId(event.target.value)}
                value={boardId}
              >
                <option value="">None</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <Label>Script</Label>
              <select
                className={selectClassName}
                onChange={(event) => setScriptId(event.target.value)}
                value={scriptId}
              >
                <option value="">None</option>
                {scripts.map((script) => (
                  <option key={script.id} value={script.id}>
                    {script.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <Label>Shoot day</Label>
              <select
                className={selectClassName}
                onChange={(event) => setShootDayEventId(event.target.value)}
                value={shootDayEventId}
              >
                <option value="">None</option>
                {shootEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} — {event.date}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1.5">
            <Label>Tags (comma-separated)</Label>
            <Input
              onChange={(event) => setTags(event.target.value)}
              value={tags}
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
              {saving ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
