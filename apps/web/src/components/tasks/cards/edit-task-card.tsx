"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  HelpCircle,
  MessageSquareWarning,
  Upload
} from "lucide-react";
import { usePrompt } from "@/components/ui/prompt-dialog";
import { SubmitDraftDialog } from "@/components/dashboard/submit-draft-dialog";
import {
  TaskProgressTracker,
  type TaskProgressStage
} from "@/components/tasks/task-progress-tracker";
import { REVIEW_STATUS_META } from "@/components/review/review-item-card";
import {
  createTaskComment,
  listDeliverablesForOwner,
  listTaskAttachments
} from "@/services/base-workspace.service";
import type { Deliverable, FileEntryItem, ProductionTask } from "@/types/base";

function computeEditStages(
  task: ProductionTask,
  latest: Deliverable | undefined
): TaskProgressStage[] {
  const labels = [
    "Assigned",
    "Editing",
    "Draft Uploaded",
    "Under Review",
    "Approved"
  ];

  let activeIndex = task.status === "todo" ? 0 : 1;
  let terminal = false;
  if (latest) {
    if (latest.status === "review") activeIndex = 3;
    else if (latest.status === "revision") activeIndex = 3;
    else if (latest.status === "approved" || latest.status === "rejected") {
      activeIndex = 4;
      terminal = true;
    } else activeIndex = 2;
  }

  return labels.map((label, index) => ({
    label:
      latest?.status === "revision" && index === 3
        ? "Changes Requested"
        : latest?.status === "rejected" && index === 4
          ? "Rejected"
          : label,
    state:
      index < activeIndex || (terminal && index === activeIndex)
        ? "done"
        : index === activeIndex
          ? "active"
          : "pending"
  }));
}

export function EditTaskCard({
  task,
  onChanged
}: {
  task: ProductionTask;
  onChanged: () => void;
}) {
  const prompt = usePrompt();
  const router = useRouter();
  const [versions, setVersions] = useState<Deliverable[]>([]);
  const [rawFootageFolder, setRawFootageFolder] =
    useState<FileEntryItem | null>(null);
  const [submitDraftOpen, setSubmitDraftOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!task.ownerType || !task.ownerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale versions when the task has no owner to look them up under, not deriving render output
      setVersions([]);
      return;
    }
    listDeliverablesForOwner({
      ownerType: task.ownerType,
      ownerId: task.ownerId
    })
      .then((all) =>
        setVersions(
          all
            .filter((d) => d.taskId === task.id)
            .sort((a, b) => b.version - a.version)
        )
      )
      .catch(() => setVersions([]));
  }, [task.id, task.ownerType, task.ownerId]);

  useEffect(() => {
    listTaskAttachments(task.id)
      .then((attachments) => {
        // The raw-footage folder linked at task creation (either the
        // shoot's upload folder or the owner's Raw Data folder) is the
        // task's only folder-type attachment - everything else attached
        // here is an individual file.
        setRawFootageFolder(
          attachments.find((entry) => entry.type === "folder") ?? null
        );
      })
      .catch(() => setRawFootageFolder(null));
  }, [task.id]);

  function handleOpenRawFootage() {
    if (!rawFootageFolder) return;
    router.push(
      `/files?folder=${encodeURIComponent(rawFootageFolder.id)}&name=${encodeURIComponent(rawFootageFolder.name)}`
    );
  }

  const latest = versions[0];

  async function handleRequestMissingFiles() {
    const message = await prompt("What files are missing?");
    if (!message) return;
    setBusy(true);
    try {
      await createTaskComment(task.id, `Missing files needed: ${message}`);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleAskQuestion() {
    const message = await prompt("What's your question?");
    if (!message) return;
    setBusy(true);
    try {
      await createTaskComment(task.id, message);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <TaskProgressTracker stages={computeEditStages(task, latest)} />

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {latest ? (
          <div>
            <span className="block text-xs text-[#667085] dark:text-[#878ca0]">
              Current Version
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-[#11142c] dark:text-[#f1f2f8]">
                v{latest.version}
              </strong>
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${REVIEW_STATUS_META[latest.status].className}`}
              >
                {REVIEW_STATUS_META[latest.status].label}
              </span>
            </span>
          </div>
        ) : null}
        {task.boardName ? (
          <div>
            <span className="block text-xs text-[#667085] dark:text-[#878ca0]">
              Storyboard
            </span>
            <strong className="text-[#11142c] dark:text-[#f1f2f8]">
              {task.boardName}
            </strong>
          </div>
        ) : null}
        {versions.length > 0 ? (
          <div>
            <span className="block text-xs text-[#667085] dark:text-[#878ca0]">
              Versions
            </span>
            <strong className="text-[#11142c] dark:text-[#f1f2f8]">
              {versions.length} submitted
            </strong>
          </div>
        ) : null}
      </div>

      {latest &&
      (latest.status === "review" || latest.status === "revision") ? (
        <Link
          className="w-fit text-xs font-bold text-[var(--fylmico-accent)] hover:underline"
          href="/review"
        >
          View in Review Queue →
        </Link>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          className="flex items-center gap-2 rounded-xl bg-[var(--fylmico-accent)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          disabled={busy}
          onClick={() => setSubmitDraftOpen(true)}
          type="button"
        >
          <Upload className="h-4 w-4" />
          Upload Draft
        </button>
        {rawFootageFolder ? (
          <button
            className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
            disabled={busy}
            onClick={handleOpenRawFootage}
            type="button"
          >
            <FolderOpen className="h-4 w-4" />
            Open Raw Footage
          </button>
        ) : null}
        <button
          className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
          disabled={busy}
          onClick={() => void handleRequestMissingFiles()}
          type="button"
        >
          <MessageSquareWarning className="h-4 w-4" />
          Request Missing Files
        </button>
        <button
          className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
          disabled={busy}
          onClick={() => void handleAskQuestion()}
          type="button"
        >
          <HelpCircle className="h-4 w-4" />
          Ask Question
        </button>
      </div>

      {submitDraftOpen && task.ownerType && task.ownerId ? (
        <SubmitDraftDialog
          nextVersion={versions.length + 1}
          onOpenChange={setSubmitDraftOpen}
          onUploaded={onChanged}
          owner={{ ownerType: task.ownerType, ownerId: task.ownerId }}
          taskId={task.id}
        />
      ) : null}
    </div>
  );
}
