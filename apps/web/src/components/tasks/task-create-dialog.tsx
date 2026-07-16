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
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  TASK_TYPE_LABELS,
  TASK_TYPES
} from "@/components/tasks/task-data";
import {
  linkTaskAttachment,
  listClients,
  listProjects,
  resolveFileDestination
} from "@/services/base-workspace.service";
import type {
  ClientItem,
  CreateTaskRequest,
  HouseMember,
  ProductionTask,
  Project,
  TaskAssigneeInput,
  TaskPriority,
  TaskType
} from "@/types/base";

const selectClassName =
  "h-10 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]";

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
  onCreate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: HouseMember[];
  tasks: ProductionTask[];
  defaultAssigneeId?: string;
  onCreate: (request: CreateTaskRequest) => Promise<ProductionTask>;
}) {
  const [type, setType] = useState<TaskType>("custom");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignees, setAssignees] = useState<TaskAssigneeInput[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [location, setLocation] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting form state each time the dialog re-opens, not deriving render output
    setAssignees(defaultAssigneeId ? [{ userId: defaultAssigneeId }] : []);
    Promise.all([listClients(), listProjects()])
      .then(([clientList, projectList]) => {
        setClients(clientList);
        setProjects(projectList);
      })
      .catch(() => {
        // Raw-footage picker just shows fewer options if this fails.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const projectsForClient = clientId
    ? projects.filter((project) =>
        project.clients.some((client) => client.id === clientId)
      )
    : [];

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
    setLocation("");
    setClientId("");
    setProjectId("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the task a name.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const created = await onCreate({
        title: title.trim(),
        type,
        priority,
        assignees: assignees.length ? assignees : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        location: type === "shoot" ? location.trim() || undefined : undefined,
        projectId: type === "edit" ? projectId || undefined : undefined
      });

      if (type === "edit" && clientId && projectId) {
        try {
          const { parentId } = await resolveFileDestination({
            clientId,
            projectId,
            category: "raw"
          });
          await linkTaskAttachment(created.id, parentId);
        } catch {
          // Task itself was created fine - the raw-footage link is best-effort.
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

          <label className="grid gap-1.5">
            <Label>Deadline</Label>
            <Input
              className="dark:[color-scheme:dark]"
              onChange={(event) => setDueDate(event.target.value)}
              type="datetime-local"
              value={dueDate}
            />
          </label>

          {type === "edit" ? (
            <div className="grid gap-1.5">
              <Label>Assign raw footage</Label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={selectClassName}
                  onChange={(event) => {
                    setClientId(event.target.value);
                    setProjectId("");
                  }}
                  value={clientId}
                >
                  <option value="">No client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <select
                  className={selectClassName}
                  disabled={!clientId}
                  onChange={(event) => setProjectId(event.target.value)}
                  value={projectId}
                >
                  <option value="">Select folder</option>
                  {projectsForClient.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
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
