"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FolderOpen,
  ListChecks,
  Pause,
  Paperclip,
  Play,
  Upload
} from "lucide-react";
import {
  PRIORITY_META,
  formatDueDate,
  toInitials
} from "@/components/tasks/task-data";
import {
  listTaskAttachments,
  listTaskTimeEntries,
  startTaskTimer,
  stopTaskTimer,
  updateTask
} from "@/services/base-workspace.service";
import type {
  FileEntryItem,
  ProductionTask,
  TaskTimeEntryItem
} from "@/types/base";

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

  async function refresh() {
    const [entries, files] = await Promise.all([
      listTaskTimeEntries(task.id),
      listTaskAttachments(task.id)
    ]);
    setTimeEntries(entries);
    setAttachments(files);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching time entries/attachments for a (possibly new) task.id, not deriving render output
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

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
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleMarkComplete() {
    setBusy(true);
    try {
      await updateTask(task.id, { status: "completed" });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const due = task.dueDate ? formatDueDate(task.dueDate) : null;
  const priority = PRIORITY_META[task.priority];
  const checklistDone = task.checklistItems.filter((item) => item.done).length;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - task.progress / 100);

  return (
    <section className="min-w-0 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
          Current Task
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${priority.badge}`}
        >
          {priority.label} Priority
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

        <div className="ml-auto flex gap-2">
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
            {runningEntry ? "Pause" : "Continue Editing"}
          </button>
          <button
            className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-bold text-[#4b5268] disabled:opacity-50 dark:border-white/10 dark:text-[#c7cad9]"
            disabled={busy}
            onClick={() => void handleMarkComplete()}
            type="button"
          >
            Mark as Complete
          </button>
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
