"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clapperboard, ImagePlus, Paperclip } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  TaskProgressTracker,
  type TaskProgressStage
} from "@/components/tasks/task-progress-tracker";
import { useUploadQueue } from "@/lib/uploads/use-upload-queue";
import {
  createShot,
  listBoards,
  updateTask
} from "@/services/base-workspace.service";
import type { Board, ProductionTask } from "@/types/base";

function computeStoryboardStages(
  status: ProductionTask["status"]
): TaskProgressStage[] {
  const terminal = status === "completed";
  const activeIndex = terminal ? 2 : status === "todo" ? 0 : 1;
  return ["To Do", "In Progress", "Completed"].map((label, index) => ({
    label,
    state:
      index < activeIndex || (terminal && index === activeIndex)
        ? "done"
        : index === activeIndex
          ? "active"
          : "pending"
  }));
}

export function StoryboardingTaskCard({
  task,
  onChanged
}: {
  task: ProductionTask;
  onChanged: () => void;
}) {
  const router = useRouter();
  const { enqueue } = useUploadQueue();
  const [boards, setBoards] = useState<Board[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listBoards()
      .then(setBoards)
      .catch(() => setBoards([]));
  }, []);

  const board = boards.find((b) => b.id === task.boardId);

  async function handleLinkBoard(boardId: string) {
    setBusy(true);
    try {
      await updateTask(task.id, { boardId });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleAddFrame() {
    if (!board) return;
    setBusy(true);
    try {
      await createShot(board.id, {
        description: "New shot",
        order: board.shots.length
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  function handleUploadReference(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    enqueue(
      file,
      { parentId: null, taskId: task.id, label: "Storyboard reference" },
      () => onChanged()
    );
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

  return (
    <div className="grid gap-4">
      <TaskProgressTracker stages={computeStoryboardStages(task.status)} />

      {board ? (
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="block text-xs text-[#667085] dark:text-[#878ca0]">
              Storyboard
            </span>
            <strong className="text-[#11142c] dark:text-[#f1f2f8]">
              {board.name}
            </strong>
          </div>
          <div>
            <span className="block text-xs text-[#667085] dark:text-[#878ca0]">
              Shots
            </span>
            <strong className="text-[#11142c] dark:text-[#f1f2f8]">
              {board.shots.length}
            </strong>
          </div>
        </div>
      ) : (
        <div className="grid gap-1.5">
          <span className="text-xs text-[#667085] dark:text-[#878ca0]">
            No storyboard linked yet
          </span>
          <Select
            disabled={busy || boards.length === 0}
            items={Object.fromEntries(boards.map((b) => [b.id, b.name]))}
            onValueChange={(next) => next && void handleLinkBoard(next)}
            value=""
          >
            <SelectTrigger className="w-full max-w-xs" size="sm">
              <SelectValue
                placeholder={
                  boards.length === 0 ? "No boards yet" : "Link a storyboard..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {boards.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="flex items-center gap-2 rounded-xl bg-[var(--fylmico-accent)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          disabled={!board}
          onClick={() => router.push("/storyboard")}
          type="button"
        >
          <Clapperboard className="h-4 w-4" />
          Open Storyboard
        </button>
        <button
          className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
          disabled={!board || busy}
          onClick={() => void handleAddFrame()}
          type="button"
        >
          <ImagePlus className="h-4 w-4" />
          Add Frame
        </button>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] dark:border-white/[0.08] dark:text-[#f1f2f8]">
          <Paperclip className="h-4 w-4" />
          Upload References
          <input
            className="hidden"
            disabled={busy}
            onChange={(event) => void handleUploadReference(event)}
            type="file"
          />
        </label>
        {task.status !== "completed" ? (
          <button
            className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
            disabled={busy}
            onClick={() => void handleMarkComplete()}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark Complete
          </button>
        ) : null}
      </div>
    </div>
  );
}
