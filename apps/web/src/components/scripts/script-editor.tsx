"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { Project, Script } from "@/types/base";
import {
  formatScriptLine,
  ScriptFormatToolbar,
  type ScriptElement
} from "@/components/scripts/script-format-toolbar";

const AUTOSAVE_DELAY_MS = 800;

export function ScriptEditor({
  script,
  projects,
  onSave,
  onDelete
}: {
  script: Script;
  projects: Project[];
  onSave: (updates: {
    title?: string;
    projectId?: string;
    content?: string;
  }) => Promise<void>;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(script.title);
  const [content, setContent] = useState(script.content);
  const [projectId, setProjectId] = useState(script.projectId ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function flushSave(updates: {
    title?: string;
    projectId?: string;
    content?: string;
  }) {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
    setStatus("saving");
    try {
      await onSave(updates);
      setStatus("saved");
    } catch {
      setStatus("idle");
    }
  }

  function scheduleSave(updates: {
    title?: string;
    projectId?: string;
    content?: string;
  }) {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    setStatus("saving");
    // Debounced while the user keeps typing, but flushed immediately on
    // blur below - otherwise navigating away within the debounce window
    // (e.g. clicking another script) silently drops the pending edit.
    saveTimeout.current = setTimeout(async () => {
      try {
        await onSave(updates);
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, AUTOSAVE_DELAY_MS);
  }

  function handleApplyFormat(element: ScriptElement) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const cursor = textarea.selectionStart;
    const lineStart = content.lastIndexOf("\n", cursor - 1) + 1;
    const nextNewline = content.indexOf("\n", cursor);
    const lineEnd = nextNewline === -1 ? content.length : nextNewline;
    const formatted = formatScriptLine(
      content.slice(lineStart, lineEnd),
      element
    );

    // Applied via execCommand (which fires a native "input" event our
    // onChange below picks up) rather than setContent directly - a plain
    // React state update bypasses the textarea's native undo stack
    // entirely, which is why Ctrl+Z previously did nothing after using
    // one of these format buttons.
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineEnd);
    const applied = document.execCommand("insertText", false, formatted);

    if (!applied) {
      // Fallback for the rare browser without execCommand support - the
      // format still gets applied, just without a native undo entry.
      const nextContent =
        content.slice(0, lineStart) + formatted + content.slice(lineEnd);
      setContent(nextContent);
      scheduleSave({ content: nextContent });
      requestAnimationFrame(() => {
        textarea.focus();
        const newCursor = lineStart + formatted.length;
        textarea.setSelectionRange(newCursor, newCursor);
      });
    }
  }

  return (
    <div className="grid min-h-0 grid-rows-[auto_auto_auto_1fr] gap-4 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <input
          className="min-w-0 flex-1 bg-transparent text-xl font-black text-[#11142c] outline-none dark:text-[#f1f2f8]"
          onBlur={() => flushSave({ title })}
          onChange={(event) => {
            setTitle(event.target.value);
            scheduleSave({ title: event.target.value });
          }}
          value={title}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#667085] dark:text-[#878ca0]">
            {status === "saving"
              ? "Saving..."
              : status === "saved"
                ? "Saved"
                : ""}
          </span>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-[#667085] transition hover:bg-red-50 hover:text-red-600 dark:text-[#878ca0] dark:hover:bg-red-500/10"
            onClick={onDelete}
            title="Delete script"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-[#667085] dark:text-[#878ca0]">
          Project
        </span>
        <Select
          items={{
            none: "No project",
            ...Object.fromEntries(
              projects.map((project) => [project.id, project.title])
            )
          }}
          onValueChange={(next) => {
            const nextId = next && next !== "none" ? next : "";
            setProjectId(nextId);
            flushSave({ projectId: nextId });
          }}
          value={projectId || "none"}
        >
          <SelectTrigger className="h-8" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No project</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <ScriptFormatToolbar onApply={handleApplyFormat} />

      <textarea
        className="min-h-[32rem] w-full resize-y rounded-xl border border-black/10 bg-transparent p-4 font-mono text-sm leading-relaxed text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:text-[#f1f2f8]"
        onBlur={() => flushSave({ content })}
        onChange={(event) => {
          setContent(event.target.value);
          scheduleSave({ content: event.target.value });
        }}
        placeholder="INT. LOCATION - DAY&#10;&#10;Start writing your script..."
        ref={textareaRef}
        spellCheck={false}
        value={content}
      />
    </div>
  );
}
