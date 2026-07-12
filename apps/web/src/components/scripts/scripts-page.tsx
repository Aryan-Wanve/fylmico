"use client";

import { useEffect, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { usePrompt } from "@/components/ui/prompt-dialog";
import { ScriptEditor } from "@/components/scripts/script-editor";
import {
  createScript,
  deleteScript,
  getScript,
  listProjects,
  listScripts,
  updateScript
} from "@/services/base-workspace.service";
import type { Project, Script, ScriptSummary } from "@/types/base";

export function ScriptsPage() {
  const prompt = usePrompt();
  const [summaries, setSummaries] = useState<ScriptSummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeScript, setActiveScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([listScripts(), listProjects()])
      .then(([scriptData, projectData]) => {
        if (cancelled) {
          return;
        }
        setSummaries(scriptData);
        setProjects(projectData);
        if (scriptData[0]) {
          getScript(scriptData[0].id).then((script) => {
            if (!cancelled) {
              setActiveScript(script);
            }
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error ? error.message : "Could not load scripts."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelect(scriptId: string) {
    if (activeScript?.id === scriptId) {
      return;
    }
    try {
      const script = await getScript(scriptId);
      setActiveScript(script);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not open this script."
      );
    }
  }

  async function handleNewScript() {
    const title = await prompt("Name your script");
    if (!title || !title.trim()) {
      return;
    }

    try {
      const script = await createScript({ title: title.trim() });
      setSummaries((current) => [
        {
          id: script.id,
          projectId: script.projectId,
          title: script.title,
          wordCount: 0,
          createdById: script.createdById,
          createdByName: script.createdByName,
          createdAt: script.createdAt,
          updatedAt: script.updatedAt
        },
        ...current
      ]);
      setActiveScript(script);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the script."
      );
    }
  }

  async function handleSave(updates: {
    title?: string;
    projectId?: string;
    content?: string;
  }) {
    if (!activeScript) {
      return;
    }

    const updated = await updateScript(activeScript.id, updates);
    setActiveScript(updated);
    setSummaries((current) =>
      current.map((summary) =>
        summary.id === updated.id
          ? {
              ...summary,
              title: updated.title,
              projectId: updated.projectId,
              wordCount: updated.content.trim()
                ? updated.content.trim().split(/\s+/).length
                : 0,
              updatedAt: updated.updatedAt
            }
          : summary
      )
    );
  }

  async function handleDelete() {
    if (!activeScript) {
      return;
    }
    if (
      !window.confirm(`Delete "${activeScript.title}"? This cannot be undone.`)
    ) {
      return;
    }

    try {
      await deleteScript(activeScript.id);
      const remaining = summaries.filter(
        (summary) => summary.id !== activeScript.id
      );
      setSummaries(remaining);
      if (remaining[0]) {
        setActiveScript(await getScript(remaining[0].id));
      } else {
        setActiveScript(null);
      }
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete the script."
      );
    }
  }

  return (
    <div className="grid h-full min-h-0 gap-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#11142c] dark:text-[#f1f2f8]">
            Scripts
          </h1>
          <p className="mt-1 text-[#5f667d] dark:text-[#a8acbf]">
            Write and store your screenplays - link a board in Storyboard to
            keep shots in sync with the pages.
          </p>
        </div>
        <button
          className="flex h-10 items-center gap-2 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
          onClick={handleNewScript}
          type="button"
        >
          <Plus className="h-4 w-4" />
          New Script
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[18rem_1fr] gap-6">
        <div className="grid min-h-0 content-start gap-2 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white p-3 dark:border-white/[0.08] dark:bg-[#171a28]">
          {loading ? (
            <p className="px-3 py-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
              Loading scripts...
            </p>
          ) : summaries.length === 0 ? (
            <div className="grid place-items-center gap-2 px-3 py-10 text-center">
              <FileText className="h-6 w-6 text-[#8a90a3] dark:text-[#7d8299]" />
              <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
                No scripts yet. Create one to get started.
              </p>
            </div>
          ) : (
            summaries.map((summary) => (
              <button
                className={`grid gap-0.5 rounded-xl px-3 py-2.5 text-left transition ${
                  activeScript?.id === summary.id
                    ? "bg-[#654cff]/10 text-[#654cff]"
                    : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                }`}
                key={summary.id}
                onClick={() => handleSelect(summary.id)}
                type="button"
              >
                <span className="truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                  {summary.title}
                </span>
                <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  {summary.wordCount} word{summary.wordCount === 1 ? "" : "s"}
                </span>
              </button>
            ))
          )}
        </div>

        {activeScript ? (
          <ScriptEditor
            key={activeScript.id}
            onDelete={handleDelete}
            onSave={handleSave}
            projects={projects}
            script={activeScript}
          />
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-black/10 bg-white/60 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <div className="grid gap-2 p-10">
              <p className="text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                Select a script or create a new one
              </p>
              <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
                Your screenplay content lives here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
