"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  MapPin,
  Play,
  Upload,
  Wrench,
  X
} from "lucide-react";
import { usePrompt } from "@/components/ui/prompt-dialog";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { ShootCancelDialog } from "@/components/dashboard/shoot-cancel-dialog";
import {
  TaskProgressTracker,
  type TaskProgressStage
} from "@/components/tasks/task-progress-tracker";
import { toInitials } from "@/components/tasks/task-data";
import { useUploadQueue } from "@/lib/uploads/use-upload-queue";
import {
  archiveShoot,
  cancelShoot,
  finishAndUploadShoot,
  finishShoot,
  getShoot,
  getShootUploadFolder,
  markShootReached,
  markShootReadyForEditing,
  markShootUploaded,
  reportShootIssue,
  requestShootExtraTime,
  startShoot
} from "@/services/base-workspace.service";
import type { ProductionTask, Shoot, TaskTimeEntryItem } from "@/types/base";

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

const SHOOT_STAGE_LABELS = [
  "Assigned",
  "Travelling",
  "Checked In",
  "Shooting",
  "Shoot Finished",
  "Footage Uploaded",
  "Ready for Editing"
];

function computeShootStages(status: Shoot["status"]): TaskProgressStage[] {
  const order: Shoot["status"][] = [
    "scheduled",
    "crew-reached",
    "started",
    "finished",
    "uploading",
    "uploaded",
    "ready-for-editing"
  ];
  const terminal =
    status === "archived" ||
    status === "cancelled" ||
    status === "ready-for-editing";
  const activeIndex = terminal ? order.length - 1 : order.indexOf(status);

  return SHOOT_STAGE_LABELS.map((label, index) => ({
    label,
    state:
      index < activeIndex || (terminal && index === activeIndex)
        ? "done"
        : index === activeIndex
          ? "active"
          : "pending"
  }));
}

function mapsEmbedSrc(location: string): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return null;
  }
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}`;
}

export function ShootTaskCard({
  task,
  runningEntry,
  onToggleTimer,
  onChanged
}: {
  task: ProductionTask;
  runningEntry: TaskTimeEntryItem | undefined;
  onToggleTimer: () => void | Promise<void>;
  onChanged: () => void;
}) {
  const prompt = usePrompt();
  const { enqueue } = useUploadQueue();
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [shootBusy, setShootBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    if (!task.shootId) {
      setShoot(null);
      return;
    }
    setShoot(await getShoot(task.shootId));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching the linked Shoot for a (possibly new) task.shootId, not deriving render output
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.shootId]);

  async function handleShootAction(action: () => Promise<Shoot>) {
    setShootBusy(true);
    try {
      setShoot(await action());
      onChanged();
    } finally {
      setShootBusy(false);
    }
  }

  if (!shoot) {
    return null;
  }

  async function handleReachedLocation() {
    await handleShootAction(() => markShootReached(shoot!.id));
  }

  async function handleStartShoot() {
    await onToggleTimer();
    await handleShootAction(() => startShoot(shoot!.id));
  }

  async function handleFinishShoot() {
    if (runningEntry) await onToggleTimer();
    await handleShootAction(() => finishShoot(shoot!.id));
  }

  function triggerFinishAndUpload() {
    uploadInputRef.current?.click();
  }

  // Footage files are the largest uploads anywhere in the app - they run
  // through the global background queue (not a blocking await) so the crew
  // can navigate away while multi-GB files upload. The shoot only advances
  // to "uploaded" once every enqueued file has actually finished.
  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }
    const files = Array.from(fileList);
    setShootBusy(true);
    try {
      if (runningEntry) await onToggleTimer();
      setShoot(await finishAndUploadShoot(shoot!.id));
      onChanged();

      const { parentId } = await getShootUploadFolder(shoot!.id);
      let remaining = files.length;
      for (const file of files) {
        enqueue(
          file,
          { parentId, label: `Shoot footage — ${task.title}` },
          () => {
            remaining -= 1;
            if (remaining === 0) {
              void (async () => {
                setShoot(await markShootUploaded(shoot!.id));
                onChanged();
              })();
            }
          }
        );
      }
    } finally {
      setShootBusy(false);
    }
  }

  async function handleMarkUploaded() {
    await handleShootAction(() => markShootUploaded(shoot!.id));
  }

  async function handleMarkReadyForEditing() {
    await handleShootAction(() => markShootReadyForEditing(shoot!.id));
  }

  async function handleArchiveShoot() {
    await handleShootAction(() => archiveShoot(shoot!.id));
  }

  async function handleCancelShoot(reason: string, notes: string) {
    await handleShootAction(() => cancelShoot(shoot!.id, reason, notes));
  }

  async function handleReportIssue() {
    const message = await prompt("What's the issue?");
    if (!message) return;
    setShootBusy(true);
    try {
      await reportShootIssue(shoot!.id, message);
    } finally {
      setShootBusy(false);
    }
  }

  async function handleRequestExtraTime() {
    const reason = await prompt(
      "Why do you need more time? (this notifies the person who assigned the shoot)"
    );
    if (!reason) return;
    setShootBusy(true);
    try {
      await requestShootExtraTime(shoot!.id, reason);
    } finally {
      setShootBusy(false);
    }
  }

  const cancellableStatuses: Shoot["status"][] = [
    "scheduled",
    "crew-reached",
    "started",
    "finished",
    "uploading"
  ];
  const embedSrc = shoot.location ? mapsEmbedSrc(shoot.location) : null;

  return (
    <div className="grid gap-4">
      <TaskProgressTracker stages={computeShootStages(shoot.status)} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#654cff]/10 px-2.5 py-1 text-xs font-bold text-[#654cff]">
          {SHOOT_STATUS_LABELS[shoot.status]}
        </span>
        <WeatherWidget />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
              Shoot Time
            </span>
            <strong className="text-[#11142c] dark:text-[#f1f2f8]">
              {shoot.callTime}
              {shoot.estFinishTime ? ` - ${shoot.estFinishTime}` : ""}
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

      {embedSrc ? (
        <iframe
          allowFullScreen
          className="h-40 w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedSrc}
          title="Shoot location map"
        />
      ) : null}

      {shoot.notes ? (
        <p className="text-sm text-[#5f667d] dark:text-[#a8acbf]">
          {shoot.notes}
        </p>
      ) : null}

      {shoot.status === "cancelled" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          <strong>Cancelled:</strong> {shoot.cancelReason}
          {shoot.cancelNotes ? ` — ${shoot.cancelNotes}` : ""}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
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
          <>
            <button
              className="flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-bold text-amber-600 disabled:opacity-50"
              disabled={shootBusy}
              onClick={() => void handleReportIssue()}
              type="button"
            >
              <AlertTriangle className="h-4 w-4" />
              Report Issue
            </button>
            <button
              className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
              disabled={shootBusy}
              onClick={() => void handleRequestExtraTime()}
              type="button"
            >
              <Clock3 className="h-4 w-4" />
              Request Extra Time
            </button>
            <button
              className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50"
              disabled={shootBusy}
              onClick={() => setCancelOpen(true)}
              type="button"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </>
        ) : null}
      </div>

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
    </div>
  );
}
