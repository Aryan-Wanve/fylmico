"use client";

import { useEffect, useState } from "react";
import { Play, Square, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  TASK_TYPE_LABELS,
  TASK_TYPES,
  formatDueDate,
  toInitials
} from "@/components/tasks/task-data";
import { TaskAssigneePicker } from "@/components/tasks/task-assignee-picker";
import { TaskDescriptionEditor } from "@/components/tasks/task-description-editor";
import {
  addChecklistItem,
  addTaskDependency,
  createTask,
  createTaskComment,
  getTask,
  listTaskActivity,
  listTaskAttachments,
  listTaskComments,
  listTaskTimeEntries,
  removeChecklistItem,
  removeTaskDependency,
  startTaskTimer,
  stopTaskTimer,
  unlinkTaskAttachment,
  updateChecklistItem,
  updateTask,
  uploadTaskAttachment
} from "@/services/base-workspace.service";
import type {
  Comment,
  FileEntryItem,
  HouseMember,
  ProductionTask,
  TaskActivityItem,
  TaskAssigneeInput,
  TaskTimeEntryItem
} from "@/types/base";

const selectClassName =
  "h-8 rounded-md border border-black/10 bg-transparent px-2 text-xs font-semibold outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c]";

function activityText(activity: TaskActivityItem): string {
  switch (activity.type) {
    case "created":
      return "created this task";
    case "status_changed":
      return `changed status from ${activity.fromValue} to ${activity.toValue}`;
    case "priority_changed":
      return `changed priority from ${activity.fromValue} to ${activity.toValue}`;
    case "due_date_changed":
      return "changed the due date";
    case "assigned":
      return "added an assignee";
    case "unassigned":
      return "removed an assignee";
    case "dependency_added":
      return `marked this blocked by "${activity.toValue}"`;
    default:
      return activity.type;
  }
}

export function TaskDetailPanel({
  taskId,
  members,
  tasks,
  currentUserId,
  onOpenChange,
  onChanged
}: {
  taskId: string;
  members: HouseMember[];
  tasks: ProductionTask[];
  currentUserId: string;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [task, setTask] = useState<ProductionTask | null>(null);
  const [activity, setActivity] = useState<TaskActivityItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [timeEntries, setTimeEntries] = useState<TaskTimeEntryItem[]>([]);
  const [attachments, setAttachments] = useState<FileEntryItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [dependencyPickerId, setDependencyPickerId] = useState("");
  const [editingAssignees, setEditingAssignees] = useState(false);
  const [draftAssignees, setDraftAssignees] = useState<TaskAssigneeInput[]>([]);

  async function refresh() {
    const [t, act, com, entries, files] = await Promise.all([
      getTask(taskId),
      listTaskActivity(taskId),
      listTaskComments(taskId),
      listTaskTimeEntries(taskId),
      listTaskAttachments(taskId)
    ]);
    setTask(t);
    setActivity(act);
    setComments(com);
    setTimeEntries(entries);
    setAttachments(files);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching task detail data for a (possibly new) taskId, not deriving render output
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  if (!task) {
    return (
      <Dialog onOpenChange={onOpenChange} open>
        <DialogContent className="max-w-3xl">
          <p className="py-10 text-center text-sm text-[#8a90a3]">Loading…</p>
        </DialogContent>
      </Dialog>
    );
  }

  const runningEntry = timeEntries.find(
    (entry) => entry.userId === currentUserId && !entry.endedAt
  );
  const totalMinutes = timeEntries.reduce(
    (sum, entry) => sum + (entry.durationMinutes ?? 0),
    0
  );
  const due = task.dueDate ? formatDueDate(task.dueDate) : null;
  const timeline = [
    ...activity.map((a) => ({
      kind: "activity" as const,
      createdAt: a.createdAt,
      item: a
    })),
    ...comments.map((c) => ({
      kind: "comment" as const,
      createdAt: c.createdAt,
      item: c
    }))
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  async function patch(updates: Parameters<typeof updateTask>[1]) {
    await updateTask(taskId, updates);
    await refresh();
    onChanged();
  }

  async function handleAddChecklistItem() {
    if (!newChecklistText.trim()) {
      return;
    }
    await addChecklistItem(taskId, newChecklistText.trim());
    setNewChecklistText("");
    await refresh();
  }

  async function handleAddSubtask() {
    if (!newSubtaskTitle.trim()) {
      return;
    }
    await createTask({ title: newSubtaskTitle.trim(), parentTaskId: taskId });
    setNewSubtaskTitle("");
    await refresh();
    onChanged();
  }

  async function handleAddComment() {
    if (!newComment.trim()) {
      return;
    }
    await createTaskComment(taskId, newComment.trim());
    setNewComment("");
    await refresh();
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    await uploadTaskAttachment(taskId, file);
    await refresh();
  }

  async function handleToggleTimer() {
    if (runningEntry) {
      await stopTaskTimer(taskId);
    } else {
      await startTaskTimer(taskId);
    }
    await refresh();
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-w-3xl">
        <div className="grid max-h-[85vh] gap-5 overflow-y-auto pr-1">
          <DialogHeader>
            <DialogTitle>
              <input
                className="w-full bg-transparent text-xl font-black text-[#11142c] outline-none dark:text-[#f1f2f8]"
                defaultValue={task.title}
                onBlur={(event) => {
                  if (
                    event.target.value.trim() &&
                    event.target.value !== task.title
                  ) {
                    void patch({ title: event.target.value.trim() });
                  }
                }}
              />
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className={selectClassName}
              onChange={(event) =>
                void patch({
                  type: event.target.value as ProductionTask["type"]
                })
              }
              value={task.type}
            >
              {TASK_TYPES.map((value) => (
                <option key={value} value={value}>
                  {TASK_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              onChange={(event) =>
                void patch({
                  status: event.target.value as ProductionTask["status"]
                })
              }
              value={task.status}
            >
              {STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {STATUS_META[value].label}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              onChange={(event) =>
                void patch({
                  priority: event.target.value as ProductionTask["priority"]
                })
              }
              value={task.priority}
            >
              {PRIORITY_ORDER.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_META[value].label}
                </option>
              ))}
            </select>
            {task.isBlocked ? (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                Blocked
              </span>
            ) : null}
            {due ? (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${due.overdue ? "bg-red-50 text-red-600" : "bg-black/[0.04] text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]"}`}
              >
                Due {due.label}
              </span>
            ) : null}
          </div>

          <section className="grid gap-1.5">
            <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Description
            </h3>
            <TaskDescriptionEditor
              onChange={(next) => setTask({ ...task, description: next })}
              value={task.description ?? ""}
            />
            <button
              className="justify-self-start text-xs font-bold text-[#654cff]"
              onClick={() =>
                void patch({ description: task.description ?? "" })
              }
              type="button"
            >
              Save description
            </button>
          </section>

          <section className="grid gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
                Assignees
              </h3>
              <button
                className="text-xs font-bold text-[#654cff]"
                onClick={() => {
                  setDraftAssignees(
                    task.assignees.map((a) => ({
                      userId: a.userId,
                      responsibility: a.responsibility ?? undefined
                    }))
                  );
                  setEditingAssignees((current) => !current);
                }}
                type="button"
              >
                {editingAssignees ? "Cancel" : "Edit"}
              </button>
            </div>
            {editingAssignees ? (
              <div className="grid gap-2">
                <TaskAssigneePicker
                  members={members}
                  onChange={setDraftAssignees}
                  selected={draftAssignees}
                  tasks={tasks}
                />
                <button
                  className="justify-self-start text-xs font-bold text-[#654cff]"
                  onClick={async () => {
                    await patch({ assignees: draftAssignees });
                    setEditingAssignees(false);
                  }}
                  type="button"
                >
                  Save assignees
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {task.assignees.length === 0 ? (
                  <span className="text-sm text-[#8a90a3]">Unassigned</span>
                ) : (
                  task.assignees.map((a) => (
                    <span
                      className="flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-semibold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]"
                      key={a.userId}
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#654cff]/10 text-[0.6rem] font-bold text-[#654cff]">
                        {toInitials(a.name)}
                      </span>
                      {a.name}
                      {a.responsibility ? ` · ${a.responsibility}` : ""}
                    </span>
                  ))
                )}
              </div>
            )}
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
                Subtasks
              </h3>
              <div className="grid gap-1">
                {task.subtasks.map((s) => (
                  <div className="flex items-center gap-2 text-sm" key={s.id}>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_META[s.status].dot}`}
                    />
                    <span className="truncate text-[#11142c] dark:text-[#f1f2f8]">
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input
                  className="h-8 text-xs"
                  onChange={(event) => setNewSubtaskTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleAddSubtask();
                    }
                  }}
                  placeholder="Add subtask..."
                  value={newSubtaskTitle}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
                Checklist{" "}
                {task.checklistItems.length ? `(${task.progress}%)` : ""}
              </h3>
              <div className="grid gap-1">
                {task.checklistItems.map((item) => (
                  <div
                    className="flex items-center gap-2 text-sm"
                    key={item.id}
                  >
                    <input
                      checked={item.done}
                      className="h-3.5 w-3.5 accent-[#654cff]"
                      onChange={async (event) => {
                        await updateChecklistItem(taskId, item.id, {
                          done: event.target.checked
                        });
                        await refresh();
                      }}
                      type="checkbox"
                    />
                    <span
                      className={`flex-1 truncate ${item.done ? "text-[#8a90a3] line-through" : "text-[#11142c] dark:text-[#f1f2f8]"}`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={async () => {
                        await removeChecklistItem(taskId, item.id);
                        await refresh();
                      }}
                      type="button"
                    >
                      <X className="h-3 w-3 text-[#8a90a3]" />
                    </button>
                  </div>
                ))}
              </div>
              <Input
                className="h-8 text-xs"
                onChange={(event) => setNewChecklistText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAddChecklistItem();
                  }
                }}
                placeholder="Add checklist item..."
                value={newChecklistText}
              />
            </div>
          </section>

          <section className="grid gap-1.5">
            <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Blocked by
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {task.blockedByTasks.map((b) => (
                <span
                  className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                  key={b.id}
                >
                  {b.title}
                  <button
                    onClick={async () => {
                      await removeTaskDependency(taskId, b.id);
                      await refresh();
                    }}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <select
                className={selectClassName}
                onChange={(event) => setDependencyPickerId(event.target.value)}
                value={dependencyPickerId}
              >
                <option value="">Select a task...</option>
                {tasks
                  .filter((t) => t.id !== taskId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
              <button
                className="text-xs font-bold text-[#654cff]"
                onClick={async () => {
                  if (!dependencyPickerId) {
                    return;
                  }
                  await addTaskDependency(taskId, dependencyPickerId);
                  setDependencyPickerId("");
                  await refresh();
                }}
                type="button"
              >
                Add
              </button>
            </div>
          </section>

          <section className="grid gap-1.5">
            <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Links
            </h3>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {task.projectTitle ? (
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-semibold dark:bg-white/[0.06]">
                  Project: {task.projectTitle}
                </span>
              ) : null}
              {task.clientName ? (
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-semibold dark:bg-white/[0.06]">
                  Client: {task.clientName}
                </span>
              ) : null}
              {task.boardName ? (
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-semibold dark:bg-white/[0.06]">
                  Storyboard: {task.boardName}
                </span>
              ) : null}
              {task.scriptTitle ? (
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-semibold dark:bg-white/[0.06]">
                  Script: {task.scriptTitle}
                </span>
              ) : null}
              {task.shootDayEventTitle ? (
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-semibold dark:bg-white/[0.06]">
                  Shoot day: {task.shootDayEventTitle}
                </span>
              ) : null}
              {task.location ? (
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-semibold dark:bg-white/[0.06]">
                  Location: {task.location}
                </span>
              ) : null}
              {task.callTime ? (
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-semibold dark:bg-white/[0.06]">
                  Call time: {task.callTime}
                </span>
              ) : null}
              {task.equipment.map((item) => (
                <span
                  className="rounded-full bg-black/[0.04] px-2.5 py-1 font-semibold dark:bg-white/[0.06]"
                  key={item}
                >
                  {item}
                </span>
              ))}
              {task.deliverables.map((item) => (
                <span
                  className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700"
                  key={item}
                >
                  {item}
                </span>
              ))}
              {task.tags.map((tag) => (
                <span
                  className="rounded-full bg-[#654cff]/10 px-2.5 py-1 font-semibold text-[#654cff]"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <section className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
                Time Tracking
              </h3>
              <button
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${runningEntry ? "bg-red-50 text-red-600" : "bg-[#654cff]/10 text-[#654cff]"}`}
                onClick={() => void handleToggleTimer()}
                type="button"
              >
                {runningEntry ? (
                  <Square className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                {runningEntry ? "Stop" : "Start"} timer
              </button>
            </div>
            <p className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
              {Math.round(totalMinutes)}m logged
              {task.estimatedMinutes
                ? ` of ${task.estimatedMinutes}m estimated`
                : ""}
            </p>
          </section>

          <section className="grid gap-1.5">
            <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Attachments
            </h3>
            <div className="grid gap-1">
              {attachments.map((file) => (
                <div className="flex items-center gap-2 text-sm" key={file.id}>
                  <span className="flex-1 truncate text-[#11142c] dark:text-[#f1f2f8]">
                    {file.name}
                  </span>
                  <button
                    onClick={async () => {
                      await unlinkTaskAttachment(taskId, file.id);
                      await refresh();
                    }}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#8a90a3]" />
                  </button>
                </div>
              ))}
            </div>
            <input onChange={(event) => void handleUpload(event)} type="file" />
          </section>

          <section className="grid gap-2">
            <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Activity &amp; Comments
            </h3>
            <div className="grid gap-2.5">
              {timeline.map((entry) =>
                entry.kind === "activity" ? (
                  <p
                    className="text-xs text-[#8a90a3] dark:text-[#7d8299]"
                    key={`a-${entry.item.id}`}
                  >
                    <strong className="text-[#4b5268] dark:text-[#c7cad9]">
                      {entry.item.actorName}
                    </strong>{" "}
                    {activityText(entry.item)}
                  </p>
                ) : (
                  <div
                    className="rounded-lg bg-black/[0.02] p-2.5 text-sm dark:bg-white/[0.03]"
                    key={`c-${entry.item.id}`}
                  >
                    <p className="text-xs font-bold text-[#11142c] dark:text-[#f1f2f8]">
                      {entry.item.authorName}
                    </p>
                    <p className="text-[#3a3f57] dark:text-[#b4b8cc]">
                      {entry.item.body}
                    </p>
                  </div>
                )
              )}
            </div>
            <div className="flex gap-2">
              <Input
                className="h-9 text-sm"
                onChange={(event) => setNewComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAddComment();
                  }
                }}
                placeholder="Add a comment... @mention a member"
                value={newComment}
              />
              <button
                className="rounded-lg bg-[#654cff] px-3 text-xs font-bold text-white"
                onClick={() => void handleAddComment()}
                type="button"
              >
                Send
              </button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
