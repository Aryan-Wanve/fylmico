"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FolderOpen,
  ListChecks,
  MapPin,
  Pause,
  Paperclip,
  Play,
  Upload,
  Wrench,
  X
} from "lucide-react";
import {
  PRIORITY_META,
  formatDueDate,
  toInitials
} from "@/components/tasks/task-data";
import { ShootCancelDialog } from "@/components/dashboard/shoot-cancel-dialog";
import {
  archiveShoot,
  cancelShoot,
  finishAndUploadShoot,
  finishShoot,
  getShoot,
  listTaskAttachments,
  listTaskTimeEntries,
  markShootReached,
  markShootReadyForEditing,
  markShootUploaded,
  startShoot,
  startTaskTimer,
  stopTaskTimer,
  updateTask,
  uploadFilesToShoot
} from "@/services/base-workspace.service";
import type {
  FileEntryItem,
  ProductionTask,
  Shoot,
  TaskTimeEntryItem
} from "@/types/base";

const SHOOT_STATUS_LABELS: Record<Shoot["status"], string> = {
  scheduled: "Scheduled",
  "crew-reached": "Crew Reached",
  started: "Shoot In Progress",
  finished: "Shoot Finished",
  uploading: "Uploading Data",
  uploaded: "Data Uploaded",
  "ready-for-editing": "Ready For Editing",
  archived: "Archived",
  cancelled: "Cancelled"
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatSession(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return [hours, mins, secs].map((n) => String(n).padStart(2, "0")).join(":");
}

export function FocusTaskCard({
  task,
  currentUserId,
  onOpenDetail,
  onSubmitDraft,
  onChanged
}: {
  task: ProductionTask;
  currentUserId: string;
  onOpenDetail: () => void;
  onSubmitDraft: () => void;
  onChanged: () => void;
}) {
  const router = useRouter();
  const [timeEntries, setTimeEntries] = useState<TaskTimeEntryItem[]>([]);
  const [attachments, setAttachments] = useState<FileEntryItem[]>([]);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [shootBusy, setShootBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const [entries, files] = await Promise.all([
      listTaskTimeEntries(task.id),
      listTaskAttachments(task.id)
    ]);
    setTimeEntries(entries);
    setAttachments(files);
    if (task.shootId) {
      setShoot(await getShoot(task.shootId));
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching time entries/attachments/shoot for a (possibly new) task.id, not deriving render output
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  async function handleShootAction(action: () => Promise<Shoot>) {
    setShootBusy(true);
    try {
      setShoot(await action());
      await refresh();
      onChanged();
    } finally {
      setShootBusy(false);
    }
  }

  const runningEntry = timeEntries.find(
    (entry) => entry.userId === currentUserId && !entry.endedAt
  );

  useEffect(() => {
    if (!runningEntry) {
      return;
    }
    const interval = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [runningEntry]);

  const sessionSeconds = runningEntry
    ? Math.max(
        0,
        Math.floor(
          (nowTick - new Date(runningEntry.startedAt).getTime()) / 1000
        )
      )
    : 0;

  const today = toDateKey(new Date());
  const todayMinutes = useMemo(
    () =>
      timeEntries
        .filter((entry) => toDateKey(new Date(entry.startedAt)) === today)
        .reduce((sum, entry) => sum + (entry.durationMinutes ?? 0), 0) +
      (runningEntry ? sessionSeconds / 60 : 0),
    [timeEntries, today, runningEntry, sessionSeconds]
  );
  const totalMinutes = useMemo(
    () =>
      timeEntries.reduce(
        (sum, entry) => sum + (entry.durationMinutes ?? 0),
        0
      ) + (runningEntry ? sessionSeconds / 60 : 0),
    [timeEntries, runningEntry, sessionSeconds]
  );

  async function handleToggleTimer() {
    setBusy(true);
    try {
      if (runningEntry) {
        await stopTaskTimer(task.id);
      } else {
        await startTaskTimer(task.id);
        if (task.status === "todo") {
          await updateTask(task.id, { status: "in-progress" });
          onChanged();
        }
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const timerLabel = runningEntry
    ? "Pause"
    : task.status === "todo"
      ? "Start Editing"
      : "Resume";

  const due = task.dueDate ? formatDueDate(task.dueDate) : null;
  const priority = PRIORITY_META[task.priority];
  const checklistDone = task.checklistItems.filter((item) => item.done).length;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - task.progress / 100);

  async function handleReachedLocation() {
    if (shoot) await handleShootAction(() => markShootReached(shoot.id));
  }

  async function handleStartShoot() {
    if (!shoot) return;
    await startTaskTimer(task.id);
    await handleShootAction(() => startShoot(shoot.id));
  }

  async function handleFinishShoot() {
    if (!shoot) return;
    if (runningEntry) await stopTaskTimer(task.id);
    await handleShootAction(() => finishShoot(shoot.id));
  }

  function triggerFinishAndUpload() {
    uploadInputRef.current?.click();
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!shoot || !fileList || fileList.length === 0) {
      return;
    }
    setShootBusy(true);
    try {
      if (runningEntry) await stopTaskTimer(task.id);
      await finishAndUploadShoot(shoot.id);
      await uploadFilesToShoot(shoot.id, Array.from(fileList));
      setShoot(await markShootUploaded(shoot.id));
      await refresh();
      onChanged();
    } finally {
      setShootBusy(false);
    }
  }

  async function handleMarkUploaded() {
    if (shoot) await handleShootAction(() => markShootUploaded(shoot.id));
  }

  async function handleMarkReadyForEditing() {
    if (shoot)
      await handleShootAction(() => markShootReadyForEditing(shoot.id));
  }

  async function handleArchiveShoot() {
    if (shoot) await handleShootAction(() => archiveShoot(shoot.id));
  }

  async function handleCancelShoot(reason: string, notes: string) {
    if (shoot)
      await handleShootAction(() => cancelShoot(shoot.id, reason, notes));
  }

  const cancellableStatuses: Shoot["status"][] = [
    "scheduled",
    "crew-reached",
    "started",
    "finished",
    "uploading"
  ];

  return (
    <section className="min-w-0 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
          Current Task
        </span>
        <span className="flex items-center gap-2">
          {shoot ? (
            <span className="rounded-full bg-[#654cff]/10 px-2.5 py-1 text-xs font-bold text-[#654cff]">
              {SHOOT_STATUS_LABELS[shoot.status]}
            </span>
          ) : null}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${priority.badge}`}
          >
            {priority.label} Priority
          </span>
        </span>
      </div>

      <h2 className="mt-2 text-xl font-black text-[#11142c] dark:text-[#f1f2f8]">
        {task.title}
      </h2>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Project
          </span>
          <strong className="text-[#11142c] dark:text-[#f1f2f8]">
            {task.projectTitle ?? "No Project"}
          </strong>
        </div>
        {task.clientName ? (
          <div>
            <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
              Client
            </span>
            <strong className="text-[#11142c] dark:text-[#f1f2f8]">
              {task.clientName}
            </strong>
          </div>
        ) : null}
        <div>
          <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Deadline
          </span>
          <strong
            className={
              due?.overdue
                ? "text-red-600"
                : "text-[#11142c] dark:text-[#f1f2f8]"
            }
          >
            {due?.label ?? "No due date"}
          </strong>
        </div>
        <div>
          <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Assigned By
          </span>
          <span className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#654cff]/10 text-[0.6rem] font-bold text-[#654cff]">
              {toInitials(task.createdByName)}
            </span>
            <strong className="text-[#11142c] dark:text-[#f1f2f8]">
              {task.createdByName}
            </strong>
          </span>
        </div>
      </div>

      {task.description ? (
        <p className="mt-4 text-sm text-[#5f667d] dark:text-[#a8acbf]">
          {task.description}
        </p>
      ) : null}

      {shoot ? (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {shoot.location ? (
            <div>
              <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
                Location
              </span>
              <a
                className="flex items-center gap-1 font-semibold text-[#654cff] hover:underline"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shoot.location)}`}
                rel="noreferrer"
                target="_blank"
              >
                <MapPin className="h-3.5 w-3.5" />
                {shoot.location}
              </a>
            </div>
          ) : null}
          {shoot.callTime ? (
            <div>
              <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
                Call Time
              </span>
              <strong className="text-[#11142c] dark:text-[#f1f2f8]">
                {shoot.callTime}
              </strong>
            </div>
          ) : null}
          {shoot.equipment.length > 0 ? (
            <div>
              <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
                Equipment
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                <Wrench className="h-3.5 w-3.5" />
                {shoot.equipment.join(", ")}
              </span>
            </div>
          ) : null}
          {shoot.crew.length > 0 ? (
            <div>
              <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
                Crew
              </span>
              <span className="flex -space-x-1.5">
                {shoot.crew.map((member) => (
                  <span
                    className="grid h-5 w-5 place-items-center rounded-full border border-white bg-[#654cff]/10 text-[0.6rem] font-bold text-[#654cff] dark:border-[#171a28]"
                    key={member.userId}
                    title={member.name}
                  >
                    {toInitials(member.name)}
                  </span>
                ))}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {shoot?.notes ? (
        <p className="mt-3 text-sm text-[#5f667d] dark:text-[#a8acbf]">
          {shoot.notes}
        </p>
      ) : null}

      {shoot?.status === "cancelled" ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          <strong>Cancelled:</strong> {shoot.cancelReason}
          {shoot.cancelNotes ? ` — ${shoot.cancelNotes}` : ""}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-5 rounded-xl bg-black/[0.02] p-4 dark:bg-white/[0.03]">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              className="text-black/[0.06] dark:text-white/[0.08]"
              cx="32"
              cy="32"
              fill="none"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              fill="none"
              r={radius}
              stroke="#654cff"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth="6"
            />
          </svg>
          <span className="absolute text-xs font-black text-[#11142c] dark:text-[#f1f2f8]">
            {task.progress}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-5 text-sm">
          <div>
            <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
              Current Session
            </span>
            <strong className="text-base text-[#11142c] dark:text-[#f1f2f8]">
              {formatSession(sessionSeconds)}
            </strong>
          </div>
          <div>
            <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
              Today&apos;s Time
            </span>
            <strong className="text-base text-[#11142c] dark:text-[#f1f2f8]">
              {formatMinutes(todayMinutes)}
            </strong>
          </div>
          <div>
            <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
              Total Time
            </span>
            <strong className="text-base text-[#11142c] dark:text-[#f1f2f8]">
              {formatMinutes(totalMinutes)}
            </strong>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap justify-end gap-2">
          {shoot ? (
            <>
              {shoot.status === "scheduled" ? (
                <button
                  className="flex items-center gap-2 rounded-xl bg-[#654cff] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  disabled={shootBusy}
                  onClick={() => void handleReachedLocation()}
                  type="button"
                >
                  Reached Location
                </button>
              ) : null}
              {shoot.status === "crew-reached" ? (
                <button
                  className="flex items-center gap-2 rounded-xl bg-[#654cff] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  disabled={shootBusy}
                  onClick={() => void handleStartShoot()}
                  type="button"
                >
                  <Play className="h-4 w-4" />
                  Start Shoot
                </button>
              ) : null}
              {shoot.status === "started" ? (
                <>
                  <button
                    className="flex items-center gap-2 rounded-xl bg-[#654cff] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void handleToggleTimer()}
                    type="button"
                  >
                    {runningEntry ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {runningEntry ? "Pause" : "Resume"}
                  </button>
                  <button
                    className="rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
                    disabled={shootBusy}
                    onClick={() => void handleFinishShoot()}
                    type="button"
                  >
                    Finish
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl bg-[#16c784] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                    disabled={shootBusy}
                    onClick={triggerFinishAndUpload}
                    type="button"
                  >
                    <Upload className="h-4 w-4" />
                    Finish + Upload
                  </button>
                </>
              ) : null}
              {shoot.status === "finished" ? (
                <button
                  className="flex items-center gap-2 rounded-xl bg-[#16c784] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  disabled={shootBusy}
                  onClick={triggerFinishAndUpload}
                  type="button"
                >
                  <Upload className="h-4 w-4" />
                  Start Upload
                </button>
              ) : null}
              {shoot.status === "uploading" ? (
                <button
                  className="flex items-center gap-2 rounded-xl bg-[#16c784] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  disabled={shootBusy}
                  onClick={() => void handleMarkUploaded()}
                  type="button"
                >
                  Mark Data Uploaded
                </button>
              ) : null}
              {shoot.status === "uploaded" ? (
                <button
                  className="rounded-xl bg-[#654cff] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  disabled={shootBusy}
                  onClick={() => void handleMarkReadyForEditing()}
                  type="button"
                >
                  Mark Ready For Editing
                </button>
              ) : null}
              {shoot.status === "ready-for-editing" ? (
                <button
                  className="rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
                  disabled={shootBusy}
                  onClick={() => void handleArchiveShoot()}
                  type="button"
                >
                  Archive Shoot
                </button>
              ) : null}
              {cancellableStatuses.includes(shoot.status) ? (
                <button
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50"
                  disabled={shootBusy}
                  onClick={() => setCancelOpen(true)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              ) : null}
            </>
          ) : (
            <button
              className="flex items-center gap-2 rounded-xl bg-[#654cff] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              disabled={busy}
              onClick={() => void handleToggleTimer()}
              type="button"
            >
              {runningEntry ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {timerLabel}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          className="grid gap-2 rounded-xl border border-black/[0.06] p-3.5 text-left dark:border-white/[0.08]"
          onClick={() => router.push("/files")}
          type="button"
        >
          <FolderOpen className="h-4 w-4 text-[#654cff]" />
          <span className="text-xs font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Drive Folder
          </span>
          <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Open in Files
          </span>
        </button>
        <button
          className="grid gap-2 rounded-xl border border-black/[0.06] p-3.5 text-left dark:border-white/[0.08]"
          onClick={onOpenDetail}
          type="button"
        >
          <ListChecks className="h-4 w-4 text-[#654cff]" />
          <span className="text-xs font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Checklist
          </span>
          <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            {checklistDone} / {task.checklistItems.length} Tasks Completed
          </span>
        </button>
        <button
          className="grid gap-2 rounded-xl border border-black/[0.06] p-3.5 text-left dark:border-white/[0.08]"
          onClick={onOpenDetail}
          type="button"
        >
          <Paperclip className="h-4 w-4 text-[#654cff]" />
          <span className="text-xs font-bold text-[#11142c] dark:text-[#f1f2f8]">
            References
          </span>
          <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            {attachments.length} Files
          </span>
        </button>
        <button
          className="grid gap-2 rounded-xl border border-black/[0.06] p-3.5 text-left dark:border-white/[0.08]"
          onClick={onSubmitDraft}
          type="button"
        >
          <Upload className="h-4 w-4 text-[#654cff]" />
          <span className="text-xs font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Submit Draft
          </span>
          <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            {attachments.length > 0
              ? `Last draft: v${attachments.length}`
              : "Drag & drop or select"}
          </span>
        </button>
      </div>

      {shoot ? (
        <>
          <input
            className="hidden"
            multiple
            onChange={(event) => void handleFilesSelected(event.target.files)}
            ref={uploadInputRef}
            type="file"
          />
          <ShootCancelDialog
            onCancel={handleCancelShoot}
            onOpenChange={setCancelOpen}
            open={cancelOpen}
          />
        </>
      ) : null}
    </section>
  );
}

export function FocusTaskEmptyState({
  onBrowseProjects
}: {
  onBrowseProjects: () => void;
}) {
  return (
    <section className="grid min-w-0 place-items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-12 text-center shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <CheckCircle2 className="h-10 w-10 text-[#16c784]" />
      <h2 className="text-lg font-black text-[#11142c] dark:text-[#f1f2f8]">
        No active task assigned.
      </h2>
      <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
        You&apos;re all caught up. Check upcoming work or browse projects.
      </p>
      <button
        className="rounded-xl bg-[#654cff] px-4 py-2.5 text-sm font-bold text-white"
        onClick={onBrowseProjects}
        type="button"
      >
        Browse Projects
      </button>
    </section>
  );
}
