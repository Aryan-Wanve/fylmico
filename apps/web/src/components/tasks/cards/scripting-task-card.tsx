"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquareWarning, PenLine } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { usePrompt } from "@/components/ui/prompt-dialog";
import {
  TaskProgressTracker,
  type TaskProgressStage
} from "@/components/tasks/task-progress-tracker";
import {
  createTaskComment,
  getScript,
  listScripts,
  updateTask
} from "@/services/base-workspace.service";
import type { ProductionTask, Script, ScriptSummary } from "@/types/base";

function wordCount(content: string): number {
  const trimmed = content.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function computeScriptingStages(
  status: ProductionTask["status"]
): TaskProgressStage[] {
  const terminal = status === "completed";
  const activeIndex = terminal
    ? 2
    : status === "review"
      ? 1
      : status === "todo"
        ? 0
        : 1;
  return ["Drafting", "Submitted", "Completed"].map((label, index) => ({
    label,
    state:
      index < activeIndex || (terminal && index === activeIndex)
        ? "done"
        : index === activeIndex
          ? "active"
          : "pending"
  }));
}

export function ScriptingTaskCard({
  task,
  onChanged
}: {
  task: ProductionTask;
  onChanged: () => void;
}) {
  const router = useRouter();
  const prompt = usePrompt();
  const [scripts, setScripts] = useState<ScriptSummary[]>([]);
  const [script, setScript] = useState<Script | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listScripts()
      .then(setScripts)
      .catch(() => setScripts([]));
  }, []);

  useEffect(() => {
    if (!task.scriptId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing a stale linked script when the task no longer references one, not deriving render output
      setScript(null);
      return;
    }
    getScript(task.scriptId)
      .then(setScript)
      .catch(() => setScript(null));
  }, [task.scriptId]);

  async function handleLinkScript(scriptId: string) {
    setBusy(true);
    try {
      await updateTask(task.id, { scriptId });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleDraft() {
    if (task.status === "todo") {
      await updateTask(task.id, { status: "in-progress" });
      onChanged();
    }
    router.push("/scripts");
  }

  async function handleSubmit() {
    setBusy(true);
    try {
      await updateTask(task.id, { status: "completed" });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestFeedback() {
    const message = await prompt("What would you like feedback on?");
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
      <TaskProgressTracker stages={computeScriptingStages(task.status)} />

      {script ? (
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="block text-xs text-[#667085] dark:text-[#878ca0]">
                Script
              </span>
              <strong className="text-[#11142c] dark:text-[#f1f2f8]">
                {script.title}
              </strong>
            </div>
            <div>
              <span className="block text-xs text-[#667085] dark:text-[#878ca0]">
                Word Count
              </span>
              <strong className="text-[#11142c] dark:text-[#f1f2f8]">
                {wordCount(script.content)}
              </strong>
            </div>
          </div>
          {script.content ? (
            <p className="line-clamp-3 rounded-lg bg-black/[0.02] p-3 text-sm text-[#5f667d] dark:bg-white/[0.03] dark:text-[#a8acbf]">
              {script.content}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-1.5">
          <span className="text-xs text-[#667085] dark:text-[#878ca0]">
            No script linked yet
          </span>
          <Select
            disabled={busy || scripts.length === 0}
            items={Object.fromEntries(scripts.map((s) => [s.id, s.title]))}
            onValueChange={(next) => next && void handleLinkScript(next)}
            value=""
          >
            <SelectTrigger className="w-full max-w-xs" size="sm">
              <SelectValue
                placeholder={
                  scripts.length === 0 ? "No scripts yet" : "Link a script..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {scripts.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="flex items-center gap-2 rounded-xl bg-[var(--fylmico-accent)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          disabled={!script}
          onClick={() => void handleDraft()}
          type="button"
        >
          <PenLine className="h-4 w-4" />
          Draft
        </button>
        {task.status !== "completed" ? (
          <button
            className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
            disabled={busy}
            onClick={() => void handleSubmit()}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit
          </button>
        ) : null}
        <button
          className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-[#11142c] disabled:opacity-50 dark:border-white/[0.08] dark:text-[#f1f2f8]"
          disabled={busy}
          onClick={() => void handleRequestFeedback()}
          type="button"
        >
          <MessageSquareWarning className="h-4 w-4" />
          Request Feedback
        </button>
      </div>
    </div>
  );
}
