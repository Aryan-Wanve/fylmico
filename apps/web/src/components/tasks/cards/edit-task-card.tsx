"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HelpCircle, MessageSquareWarning, Upload } from "lucide-react";
import { usePrompt } from "@/components/ui/prompt-dialog";
import { SubmitDraftDialog } from "@/components/dashboard/submit-draft-dialog";
import {
  TaskProgressTracker,
  type TaskProgressStage
} from "@/components/tasks/task-progress-tracker";
import { REVIEW_STATUS_META } from "@/components/review/review-item-card";
import {
  createTaskComment,
  listDeliverables
} from "@/services/base-workspace.service";
import type { Deliverable, ProductionTask } from "@/types/base";

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
    else if (latest.status === "approved" || latest.status === "final") {
      activeIndex = 4;
      terminal = true;
    } else activeIndex = 2;
  }

  return labels.map((label, index) => ({
    label:
      latest?.status === "revision" && index === 3
        ? "Changes Requested"
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
  const [versions, setVersions] = useState<Deliverable[]>([]);
  const [submitDraftOpen, setSubmitDraftOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!task.projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale versions when the task has no project to look them up in, not deriving render output
      setVersions([]);
      return;
    }
    listDeliverables(task.projectId)
      .then((all) =>
        setVersions(
          all
            .filter((d) => d.taskId === task.id)
            .sort((a, b) => b.version - a.version)
        )
      )
      .catch(() => setVersions([]));
  }, [task.id, task.projectId]);

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
            <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
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
            <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
              Storyboard
            </span>
            <strong className="text-[#11142c] dark:text-[#f1f2f8]">
              {task.boardName}
            </strong>
          </div>
        ) : null}
        {versions.length > 0 ? (
          <div>
            <span className="block text-xs text-[#8a90a3] dark:text-[#7d8299]">
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
          className="w-fit text-xs font-bold text-[#654cff] hover:underline"
          href="/review"
        >
          View in Review Queue →
        </Link>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          className="flex items-center gap-2 rounded-xl bg-[#654cff] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          disabled={busy}
          onClick={() => setSubmitDraftOpen(true)}
          type="button"
        >
          <Upload className="h-4 w-4" />
          Upload Draft
        </button>
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

      {submitDraftOpen && task.projectId ? (
        <SubmitDraftDialog
          nextVersion={versions.length + 1}
          onOpenChange={setSubmitDraftOpen}
          onUploaded={onChanged}
          projectId={task.projectId}
          taskId={task.id}
        />
      ) : null}
    </div>
  );
}
