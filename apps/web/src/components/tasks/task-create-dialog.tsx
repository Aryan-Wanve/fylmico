"use client";

import { useEffect, useState } from "react";
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
import { OwnerSelect, type OwnerValue } from "@/components/owners/owner-select";
import { toISODate } from "@/lib/calendar-utils";
import { TaskAssigneePicker } from "@/components/tasks/task-assignee-picker";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  TASK_TYPE_LABELS,
  TASK_TYPES
} from "@/components/tasks/task-data";
import {
  createShootForOwner,
  getShootUploadFolder,
  linkTaskAttachment,
  listBoards,
  listScripts,
  listShoots,
  resolveFileDestination
} from "@/services/base-workspace.service";
import type {
  Board,
  CreateTaskRequest,
  HouseMember,
  ProductionTask,
  ScriptSummary,
  Shoot,
  TaskAssigneeInput,
  TaskPriority,
  TaskType
} from "@/types/base";

const COMMON_TASK_TYPES: TaskType[] = [
  "shoot",
  "edit",
  "color-grade",
  "script-writing",
  "meeting",
  "custom"
];
const MORE_TASK_TYPES = TASK_TYPES.filter(
  (value) => !COMMON_TASK_TYPES.includes(value)
);

export function TaskCreateDialog({
  open,
  onOpenChange,
  members,
  tasks,
  defaultAssigneeId,
  onCreate,
  onShootCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: HouseMember[];
  tasks: ProductionTask[];
  defaultAssigneeId?: string;
  onCreate: (request: CreateTaskRequest) => Promise<ProductionTask>;
  onShootCreated: () => void;
}) {
  const [type, setType] = useState<TaskType>("custom");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignees, setAssignees] = useState<TaskAssigneeInput[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [estFinishTime, setEstFinishTime] = useState("");
  const [location, setLocation] = useState("");
  const [owner, setOwner] = useState<OwnerValue | null>(null);
  const [shootId, setShootId] = useState("");
  const [boardId, setBoardId] = useState("");
  const [scriptId, setScriptId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const todayISO = toISODate(new Date());

  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [scripts, setScripts] = useState<ScriptSummary[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting form state each time the dialog re-opens, not deriving render output
    setAssignees(defaultAssigneeId ? [{ userId: defaultAssigneeId }] : []);
    Promise.all([listBoards(), listScripts()])
      .then(([boardList, scriptList]) => {
        setBoards(boardList);
        setScripts(scriptList);
      })
      .catch(() => {
        // Storyboard/script pickers just show fewer options if this fails.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (owner?.ownerType !== "project") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the shoot picker's options when its parent project selection is cleared, not deriving render output
      setShoots([]);
      return;
    }
    listShoots(owner.ownerId)
      .then((shootList) =>
        setShoots(
          shootList.filter(
            (shoot) =>
              shoot.status === "uploaded" ||
              shoot.status === "ready-for-editing"
          )
        )
      )
      .catch(() => {
        // Shoot picker just shows fewer options if this fails.
      });
  }, [owner]);

  function handleSelectType(value: TaskType) {
    setType(value);
    if (!titleTouched && value !== "custom") {
      const count = tasks.filter((task) => task.type === value).length;
      setTitle(`${TASK_TYPE_LABELS[value]} ${count + 1}`);
    }
  }

  function reset() {
    setType("custom");
    setTitle("");
    setTitleTouched(false);
    setShowMoreTypes(false);
    setPriority("medium");
    setAssignees([]);
    setDueDate("");
    setCallTime("");
    setEstFinishTime("");
    setLocation("");
    setOwner(null);
    setShootId("");
    setBoardId("");
    setScriptId("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the task a name.");
      return;
    }
    if (type === "shoot" && !owner) {
      setError("Pick which project or client this shoot belongs to.");
      return;
    }
    if (type === "shoot" && !dueDate) {
      setError("Pick a shoot date.");
      return;
    }
    if (type === "shoot" && dueDate) {
      const scheduled = callTime
        ? new Date(`${dueDate}T${callTime}`)
        : new Date(`${dueDate}T23:59`);
      if (scheduled.getTime() < Date.now()) {
        setError("Pick a shoot date and time that hasn't already passed.");
        return;
      }
    }
    if (
      type !== "shoot" &&
      dueDate &&
      new Date(dueDate).getTime() < Date.now()
    ) {
      setError("Pick a deadline that hasn't already passed.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      if (type === "shoot") {
        // Shoots are their own entity (call time, crew, equipment, a
        // status machine) - creating one here goes through the same
        // shootsService.create used from the Project detail page, which
        // creates the linked Task in the same transaction, rather than a
        // bare Task with type "shoot" and no Shoot behind it.
        await createShootForOwner(owner!, {
          name: title.trim(),
          scheduledDate: new Date(dueDate).toISOString(),
          callTime: callTime.trim() || undefined,
          estFinishTime: estFinishTime.trim() || undefined,
          location: location.trim() || undefined,
          crewIds: assignees.map((assignee) => assignee.userId)
        });
        onShootCreated();
      } else {
        const created = await onCreate({
          title: title.trim(),
          type,
          priority,
          assignees: assignees.length ? assignees : undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          ownerType: type === "edit" ? owner?.ownerType : undefined,
          projectId:
            type === "edit" && owner?.ownerType === "project"
              ? owner.ownerId
              : undefined,
          clientId:
            type === "edit" && owner?.ownerType === "client"
              ? owner.ownerId
              : undefined,
          boardId: type === "storyboarding" ? boardId || undefined : undefined,
          scriptId:
            type === "script-writing" ? scriptId || undefined : undefined
        });

        if (type === "edit" && shootId) {
          try {
            const { parentId } = await getShootUploadFolder(shootId);
            await linkTaskAttachment(created.id, parentId);
          } catch {
            // Task itself was created fine - the footage link is best-effort.
          }
        } else if (type === "edit" && owner) {
          try {
            const { parentId } = await resolveFileDestination({
              ownerType: owner.ownerType,
              ownerId: owner.ownerId,
              category: "raw"
            });
            await linkTaskAttachment(created.id, parentId);
          } catch {
            // Task itself was created fine - the raw-footage link is best-effort.
          }
        }
      }

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
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TASK_TYPES.map((value) => (
                <button
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    type === value
                      ? "bg-[#654cff] text-white"
                      : "bg-black/[0.04] text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]"
                  }`}
                  key={value}
                  onClick={() => handleSelectType(value)}
                  type="button"
                >
                  {TASK_TYPE_LABELS[value]}
                </button>
              ))}
              {showMoreTypes
                ? MORE_TASK_TYPES.map((value) => (
                    <button
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        type === value
                          ? "bg-[#654cff] text-white"
                          : "bg-black/[0.04] text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]"
                      }`}
                      key={value}
                      onClick={() => handleSelectType(value)}
                      type="button"
                    >
                      {TASK_TYPE_LABELS[value]}
                    </button>
                  ))
                : null}
              <button
                className="rounded-full px-3 py-1.5 text-xs font-bold text-[#654cff]"
                onClick={() => setShowMoreTypes((current) => !current)}
                type="button"
              >
                {showMoreTypes ? "Show less" : "Show more"}
              </button>
            </div>
          </div>

          <label className="grid gap-1.5">
            <Label>Description</Label>
            <Input
              autoFocus
              onChange={(event) => {
                setTitle(event.target.value);
                setTitleTouched(true);
              }}
              placeholder="Color grade the interview scene"
              value={title}
            />
          </label>

          <div className="grid gap-1.5">
            <Label>Priority</Label>
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

          <div className="grid gap-1.5">
            <Label>Assign to</Label>
            <TaskAssigneePicker
              members={members}
              onChange={setAssignees}
              selected={assignees}
              tasks={tasks}
            />
          </div>

          {type === "shoot" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="grid gap-1.5">
                <Label>Shoot Date</Label>
                <DatePicker
                  minDate={todayISO}
                  onChange={setDueDate}
                  value={dueDate}
                />
              </label>
              <label className="grid gap-1.5">
                <Label>Shoot Time</Label>
                <Input
                  min={
                    dueDate === todayISO
                      ? new Date().toTimeString().slice(0, 5)
                      : undefined
                  }
                  onChange={(event) => setCallTime(event.target.value)}
                  type="time"
                  value={callTime}
                />
              </label>
              <label className="grid gap-1.5">
                <Label>Est. Finish Time (optional)</Label>
                <Input
                  onChange={(event) => setEstFinishTime(event.target.value)}
                  type="time"
                  value={estFinishTime}
                />
              </label>
            </div>
          ) : (
            <label className="grid gap-1.5">
              <Label>Deadline</Label>
              <DatePicker
                minDate={todayISO}
                onChange={setDueDate}
                value={dueDate}
                withTime
              />
            </label>
          )}

          {type === "shoot" ? (
            <div className="grid gap-1.5">
              <Label>Project or Client</Label>
              <OwnerSelect onChange={setOwner} value={owner} />
            </div>
          ) : null}

          {type === "edit" ? (
            <div className="grid gap-1.5">
              <Label>Assign raw footage</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <OwnerSelect
                  onChange={(next) => {
                    setOwner(next);
                    setShootId("");
                  }}
                  value={owner}
                />
                <Select
                  disabled={
                    owner?.ownerType !== "project" || shoots.length === 0
                  }
                  items={{
                    none:
                      shoots.length === 0 ? "No shoots ready" : "Whole folder",
                    ...Object.fromEntries(
                      shoots.map((shoot) => [shoot.id, shoot.name])
                    )
                  }}
                  onValueChange={(next) =>
                    setShootId(next && next !== "none" ? next : "")
                  }
                  value={shootId || "none"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {shoots.length === 0 ? "No shoots ready" : "Whole folder"}
                    </SelectItem>
                    {shoots.map((shoot) => (
                      <SelectItem key={shoot.id} value={shoot.id}>
                        {shoot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {type === "shoot" ? (
            <label className="grid gap-1.5">
              <Label>Location (Google Maps link)</Label>
              <Input
                onChange={(event) => setLocation(event.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                value={location}
              />
            </label>
          ) : null}

          {type === "storyboarding" ? (
            <div className="grid gap-1.5">
              <Label>Storyboard (optional)</Label>
              <Select
                items={{
                  none: "No storyboard",
                  ...Object.fromEntries(boards.map((b) => [b.id, b.name]))
                }}
                onValueChange={(next) =>
                  setBoardId(next && next !== "none" ? next : "")
                }
                value={boardId || "none"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No storyboard</SelectItem>
                  {boards.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {type === "script-writing" ? (
            <div className="grid gap-1.5">
              <Label>Script (optional)</Label>
              <Select
                items={{
                  none: "No script",
                  ...Object.fromEntries(scripts.map((s) => [s.id, s.title]))
                }}
                onValueChange={(next) =>
                  setScriptId(next && next !== "none" ? next : "")
                }
                value={scriptId || "none"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No script</SelectItem>
                  {scripts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

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
